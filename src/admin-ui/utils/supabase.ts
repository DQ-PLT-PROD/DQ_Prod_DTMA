import { getSupabase } from "../../lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import type { Database } from "../../lib/supabase/types";

export interface MediaItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  bodyHtml?: string | null;
  bodyJson?: any | null;
  type:
  | "Article"
  | "Report"
  | "Announcement"
  | "Event"
  | "Podcast"
  | "Video"
  | "Tool"
  | "Image";
  category?: string | null;
  status: "Draft" | "InReview" | "Scheduled" | "Published" | "Archived";
  visibility: "Public" | "Private";
  language: string;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  tags?: string[];
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  podcastUrl?: string | null;
  documentUrl?: string | null;
  durationSec?: number | null;
  fileSizeBytes?: number | null;
  eventDate?: string | null;
  eventTime?: string | null;
  eventLocation?: string | null;
  eventLocationDetails?: string | null;
  eventRegistrationInfo?: string | null;
  eventAgenda?: any | null;
}

export interface Asset {
  id: string;
  mediaId: string;
  storagePath: string;
  publicUrl: string;
  mime: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  checksum: string;
  kind?: "Image" | "Video" | "Audio" | "Doc";
}

export interface Taxonomy {
  id: string;
  kind: "Domain" | "Stage" | "Format" | "Tag";
  label: string;
  key: string;
}
export interface Submission {
  id: string;
  mediaId: string;
  state: "Submitted" | "Approved" | "Rejected";
  reviewerId: string | null;
  createdAt: string;
}
export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  at: string;
  entity: string;
  entityId: string;
  diff: any;
}

// TODO(schema): Ensure media_items includes seo_title, seo_description, canonical_url, tags, category, body_html, body_json, and thumbnail_url columns.
export const mediaService = {
  async uploadThumbnail(
    file: File,
    mediaId: string,
  ): Promise<{ publicUrl: string }> {
    const supabase = getSupabase();
    const bucket = "media-thumbnails";
    const slugName = (name: string) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9\.]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    const key = `thumbnails/${mediaId}/${Date.now()}-${slugName(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(key, file, {
        contentType: file.type,
        upsert: false,
      });
    if (upErr) throw new Error(upErr.message || "Upload failed");
    const { data } = supabase.storage.from(bucket).getPublicUrl(key);
    if (!data?.publicUrl)
      throw new Error("No public URL returned for uploaded thumbnail");
    return { publicUrl: data.publicUrl };
  },

  // Persist an uploaded asset: validate URL, update media_items columns, and record in media_assets
  async persistUploadedAsset(params: {
    mediaId: string
    kind: 'Image' | 'Video' | 'Audio' | 'Doc'
    publicUrl: string
    storagePath: string
    mime?: string | null
    sizeBytes?: number | null
    durationSec?: number | null
    checksum?: string | null
  }): Promise<MediaItem> {
    const { mediaId, kind, publicUrl, storagePath, mime, sizeBytes, durationSec, checksum } = params
    // Best-effort validation: ensure URL is reachable
    try {
      const res = await fetch(publicUrl, { method: 'HEAD' })
      if (!(res && (res.status === 200 || res.status === 204))) {
        // Try GET small range as a fallback in case of HEAD/CORS restrictions
        const g = await fetch(publicUrl, { method: 'GET' })
        if (!(g && g.ok)) throw new Error(`Asset URL not reachable (${g?.status || res?.status})`)
      }
    } catch (e) {
      console.warn('URL validation failed; proceeding anyway', { url: publicUrl, error: e })
    }
    // Update main media record with the canonical URL + metadata
    const updates: Partial<MediaItem> = {}
    if (kind === 'Image') updates.thumbnailUrl = publicUrl
    if (kind === 'Video') {
      (updates as any).videoUrl = publicUrl
      if (typeof durationSec === 'number') (updates as any).durationSec = durationSec
      if (typeof sizeBytes === 'number') (updates as any).fileSizeBytes = sizeBytes
    }
    if (kind === 'Audio') {
      (updates as any).podcastUrl = publicUrl
      if (typeof durationSec === 'number') (updates as any).durationSec = durationSec
      if (typeof sizeBytes === 'number') (updates as any).fileSizeBytes = sizeBytes
    }
    if (kind === 'Doc') {
      (updates as any).documentUrl = publicUrl
      if (typeof sizeBytes === 'number') (updates as any).fileSizeBytes = sizeBytes
    }
    const updated = await mediaService.updateMediaItem(mediaId, updates)
    // Track in media_assets for auditing/catalog
    try {
      await assetService.createAsset({
        mediaId,
        kind,
        publicUrl,
        storagePath,
        mime: mime || null,
        sizeBytes: sizeBytes ?? null,
        durationSec: durationSec ?? null,
        checksum: checksum || null,
      })
    } catch (e) {
      console.warn('Failed to record asset in media_assets', e)
    }
    return updated
  },

  async getMediaItems(
    filters: any = {},
    page = 1,
    pageSize = 10,
    orderBy = { field: "publishedAt", direction: "desc" as "asc" | "desc" },
  ) {
    let query = getSupabase()
      .from("media_items")
      .select("*", { count: "exact" });
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.visibility) query = query.eq("visibility", filters.visibility);
    if (filters.language) query = query.eq("language", filters.language);
    if (filters.search)
      query = query.or(
        `title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`,
      );

    const orderField =
      orderBy.field === "publishedAt"
        ? "published_at"
        : orderBy.field === "updatedAt"
          ? "updated_at"
          : "created_at";
    query = query.order(orderField, { ascending: orderBy.direction === "asc" });
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    const { data, error, count } = await query;
    if (error) throw error;
    const mapped = (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      body: item.body,
      bodyHtml: item.body_html ?? null,
      bodyJson: item.body_json ?? null,
      type: item.type,
      category: item.category,
      status: item.status,
      visibility: item.visibility,
      language: item.language,
      publishedAt: item.published_at,
      updatedAt: item.updated_at,
      createdAt: item.created_at,
      tags: item.tags || [],
      thumbnailUrl: item.thumbnail_url ?? null,
      videoUrl: (item as any).video_url ?? null,
      podcastUrl: (item as any).podcast_url ?? null,
      documentUrl: (item as any).document_url ?? null,
      durationSec: (item as any).duration_sec ?? null,
      fileSizeBytes: (item as any).file_size_bytes ?? null,
    })) as MediaItem[];
    return { data: mapped, count: count || 0 };
  },

  async getMediaItemById(id: string) {
    const { data, error } = await getSupabase()
      .from("media_items")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    if (!data) throw new Error("No data returned for media item");
    const mapped: MediaItem = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      body: data.body,
      bodyHtml: data.body_html ?? null,
      bodyJson: data.body_json ?? null,
      type: (data.type as MediaItem['type']),
      category: data.category,
      status: (data.status as MediaItem['status']),
      visibility: (data.visibility as MediaItem['visibility']),
      language: data.language,
      publishedAt: data.published_at,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
      seoTitle: data.seo_title,
      seoDescription: data.seo_description,
      canonicalUrl: data.canonical_url,
      tags: data.tags || [],
      thumbnailUrl: data.thumbnail_url ?? null,
      videoUrl: (data as any).video_url ?? null,
      podcastUrl: (data as any).podcast_url ?? null,
      documentUrl: (data as any).document_url ?? null,
      durationSec: (data as any).duration_sec ?? null,
      fileSizeBytes: (data as any).file_size_bytes ?? null,
    };
    return mapped;
  },

  async createMediaItem(data: Partial<MediaItem>) {
    const payload: Database["public"]["Tables"]["media_items"]["Insert"] = {
      id: uuidv4(),
      title: data.title!,
      slug: data.slug!,
      summary: data.summary!,
      body: data.bodyHtml || data.body || "",
      body_html: data.bodyHtml || null,
      body_json: data.bodyJson || null,
      type: data.type!,
      category: data.category || null,
      status: data.status || "Draft",
      visibility: data.visibility || "Public",
      language: data.language || "en",
      published_at: data.publishedAt || null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
      canonical_url: data.canonicalUrl || null,
      thumbnail_url: (data as any).thumbnailUrl || null,
      video_url: (data as any).videoUrl || null,
      podcast_url: (data as any).podcastUrl || null,
      document_url: (data as any).documentUrl || null,
      duration_sec: (data as any).durationSec || null,
      file_size_bytes: (data as any).fileSizeBytes || null,
      event_date: data.eventDate || null,
      event_time: data.eventTime || null,
      event_location: data.eventLocation || null,
      event_location_details: data.eventLocationDetails || null,
      event_registration_info: data.eventRegistrationInfo || null,
      event_agenda: data.eventAgenda || null,
      tags: Array.from(
        new Set(
          [...(data.tags || []), data.type, data.category].filter(Boolean),
        ),
      ) as string[],
    };
    try {
      const { data: inserted, error } = await getSupabase()
        .from("media_items")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      if (!inserted) throw new Error("Insert returned no data");
      return {
        id: inserted.id,
        title: inserted.title,
        slug: inserted.slug,
        summary: inserted.summary,
        body: inserted.body,
        bodyHtml: inserted.body_html ?? null,
        bodyJson: inserted.body_json ?? null,
        type: inserted.type,
        category: inserted.category,
        status: inserted.status,
        visibility: inserted.visibility,
        language: inserted.language,
        publishedAt: inserted.published_at,
        updatedAt: inserted.updated_at,
        createdAt: inserted.created_at,
        seoTitle: inserted.seo_title,
        seoDescription: inserted.seo_description,
        canonicalUrl: inserted.canonical_url,
        tags: inserted.tags || [],
        thumbnailUrl: inserted.thumbnail_url ?? null,
      } as MediaItem;
    } catch (e: any) {
      const msg = String(e?.message || "").toLowerCase();
      // Fallback: remove optional/extended columns if the table doesn't have them yet
      if (
        msg.includes("could not find") ||
        msg.includes("schema cache") ||
        msg.includes("column") ||
        msg.includes("body_html") ||
        msg.includes("body_json") ||
        msg.includes("thumbnail_url") ||
        msg.includes("video_url") ||
        msg.includes("podcast_url") ||
        msg.includes("document_url") ||
        msg.includes("duration_sec") ||
        msg.includes("file_size_bytes") ||
        msg.includes("seo_title") ||
        msg.includes("seo_description") ||
        msg.includes("canonical_url")
      ) {
        const fallbackPayload = { ...payload };
        delete fallbackPayload.body_html;
        delete fallbackPayload.body_json;
        delete fallbackPayload.thumbnail_url;
        delete (fallbackPayload as any).video_url;
        delete (fallbackPayload as any).podcast_url;
        delete (fallbackPayload as any).document_url;
        delete (fallbackPayload as any).duration_sec;
        delete (fallbackPayload as any).file_size_bytes;
        delete (fallbackPayload as any).seo_title;
        delete (fallbackPayload as any).seo_description;
        delete (fallbackPayload as any).canonical_url;
        const { data: inserted, error: insertError } = await getSupabase()
          .from("media_items")
          .insert([fallbackPayload])
          .select()
          .single();
        if (insertError || !inserted)
          throw insertError || new Error("Insert returned no data");
        return {
          id: inserted.id,
          title: inserted.title,
          slug: inserted.slug,
          summary: inserted.summary,
          body: inserted.body,
          type: inserted.type,
          category: inserted.category,
          status: inserted.status,
          visibility: inserted.visibility,
          language: inserted.language,
          publishedAt: inserted.published_at,
          updatedAt: inserted.updated_at,
          createdAt: inserted.created_at,
          seoTitle: inserted.seo_title,
          seoDescription: inserted.seo_description,
          canonicalUrl: inserted.canonical_url,
          tags: inserted.tags || [],
        } as MediaItem;
      }
      console.error("Supabase insert failed (media_items)", {
        error: e,
        payload,
      });
      throw new Error(e?.message || "Insert failed");
    }
  },

  async updateMediaItem(id: string, data: Partial<MediaItem>) {
    const updatePayload: Database["public"]["Tables"]["media_items"]["Update"] =
    {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      body: data.bodyHtml || data.body,
      body_html: data.bodyHtml,
      body_json: data.bodyJson,
      type: (data.type as MediaItem['type']),
      category: data.category,
      status: (data.status as MediaItem['status']),
      visibility: (data.visibility as MediaItem['visibility']),
      language: data.language,
      published_at: data.publishedAt,
      updated_at: new Date().toISOString(),
      seo_title: data.seoTitle,
      seo_description: data.seoDescription,
      canonical_url: data.canonicalUrl,
      thumbnail_url: (data as any).thumbnailUrl,
      video_url: (data as any).videoUrl,
      podcast_url: (data as any).podcastUrl,
      document_url: (data as any).documentUrl,
      duration_sec: (data as any).durationSec as any,
      file_size_bytes: (data as any).fileSizeBytes as any,
      event_date: data.eventDate,
      event_time: data.eventTime,
      event_location: data.eventLocation,
      event_location_details: data.eventLocationDetails,
      event_registration_info: data.eventRegistrationInfo,
      event_agenda: data.eventAgenda,
      tags: Array.from(
        new Set(
          [...(data.tags || []), data.type, data.category].filter(Boolean),
        ),
      ) as string[],
    };
    try {
      const { data: updated, error } = await getSupabase()
        .from("media_items")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (!updated) throw new Error("Update returned no data");
      return {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        summary: updated.summary,
        body: updated.body,
        bodyHtml: updated.body_html ?? null,
        bodyJson: updated.body_json ?? null,
        type: updated.type,
        category: updated.category,
        status: updated.status,
        visibility: updated.visibility,
        language: updated.language,
        publishedAt: updated.published_at,
        updatedAt: updated.updated_at,
        createdAt: updated.created_at,
        seoTitle: updated.seo_title,
        seoDescription: updated.seo_description,
        canonicalUrl: updated.canonical_url,
        tags: updated.tags || [],
        thumbnailUrl: updated.thumbnail_url ?? null,
      } as MediaItem;
    } catch (e: any) {
      const msg = String(e?.message || "").toLowerCase();
      if (
        msg.includes("could not find") ||
        msg.includes("schema cache") ||
        msg.includes("column") ||
        msg.includes("body_html") ||
        msg.includes("body_json") ||
        msg.includes("thumbnail_url") ||
        msg.includes("video_url") ||
        msg.includes("podcast_url") ||
        msg.includes("document_url") ||
        msg.includes("duration_sec") ||
        msg.includes("file_size_bytes") ||
        msg.includes("seo_title") ||
        msg.includes("seo_description") ||
        msg.includes("canonical_url")
      ) {
        const fallbackPayload = { ...updatePayload };
        delete fallbackPayload.body_html;
        delete fallbackPayload.body_json;
        delete fallbackPayload.thumbnail_url;
        delete (fallbackPayload as any).video_url;
        delete (fallbackPayload as any).podcast_url;
        delete (fallbackPayload as any).document_url;
        delete (fallbackPayload as any).duration_sec;
        delete (fallbackPayload as any).file_size_bytes;
        delete (fallbackPayload as any).seo_title;
        delete (fallbackPayload as any).seo_description;
        delete (fallbackPayload as any).canonical_url;
        const { data: updated, error: updateError } = await getSupabase()
          .from("media_items")
          .update(fallbackPayload)
          .eq("id", id)
          .select()
          .single();
        if (updateError || !updated)
          throw updateError || new Error("Update returned no data");
        return {
          id: updated.id,
          title: updated.title,
          slug: updated.slug,
          summary: updated.summary,
          body: updated.body,
          type: updated.type,
          category: updated.category,
          status: updated.status,
          visibility: updated.visibility,
          language: updated.language,
          publishedAt: updated.published_at,
          updatedAt: updated.updated_at,
          createdAt: updated.created_at,
          seoTitle: updated.seo_title,
          seoDescription: updated.seo_description,
          canonicalUrl: updated.canonical_url,
          tags: updated.tags || [],
        } as MediaItem;
      }
      console.error("Supabase update failed (media_items)", {
        error: e,
        id,
        payload: updatePayload,
      });
      throw new Error(e?.message || "Update failed");
    }
  },

  async deleteMediaItem(id: string) {
    const { error } = await getSupabase()
      .from("media_items")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  async getStatusCounts() {
    const { data, error } = await getSupabase()
      .from("media_items")
      .select("status");
    if (error) throw error;
    const counts: Record<string, number> = {
      Draft: 0,
      InReview: 0,
      Scheduled: 0,
      Published: 0,
      Archived: 0,
    };
    (data || []).forEach((m: any) => {
      if (Object.prototype.hasOwnProperty.call(counts, m.status))
        counts[m.status]++;
    });
    return counts;
  },

  async getAvailableTags(): Promise<string[]> {
    try {
      const { data, error } = await getSupabase()
        .from("media_items")
        .select("tags, type, category");
      if (error) throw error;
      const allTags = (data || []).flatMap((r: any) =>
        Array.isArray(r?.tags) ? r.tags : [],
      );
      const allTypes = (data || []).map((r: any) => r?.type).filter(Boolean);
      const allCats = (data || []).map((r: any) => r?.category).filter(Boolean);
      const all = [...allTags, ...allTypes, ...allCats];
      const uniq = Array.from(new Set(all.filter(Boolean))) as string[];
      return uniq.sort((a, b) => a.localeCompare(b));
    } catch {
      return [
        "Business",
        "Finance",
        "Technology",
        "Marketing",
        "Export",
        "SME",
        "Growth",
      ];
    }
  },
};

// Stubs for extended services used by MediaDetail (optional to flesh out later)
export const assetService = {
  async getAssetsByMediaId(mediaId: string) {
    const { data, error } = await getSupabase()
      .from('media_assets')
      .select('*')
      .eq('media_id', mediaId)
      .order('created_at', { ascending: false })
    if (error) throw error
    const mapped = (data || []).map((a: any) => ({
      id: a.id,
      mediaId: a.media_id,
      storagePath: a.storage_path,
      publicUrl: a.public_url,
      mime: a.mime || 'application/octet-stream',
      sizeBytes: a.size_bytes || 0,
      width: null,
      height: null,
      durationSec: a.duration_sec || null,
      checksum: a.checksum || '',
      kind: (a.kind as any) || undefined,
    })) as Asset[]
    return mapped
  },
  async createAsset(params: { mediaId: string; kind: 'Image' | 'Video' | 'Audio' | 'Doc'; publicUrl: string; storagePath: string; mime?: string | null; sizeBytes?: number | null; durationSec?: number | null; checksum?: string | null }) {
    const payload: any = {
      id: uuidv4(),
      media_id: params.mediaId,
      kind: params.kind,
      public_url: params.publicUrl,
      storage_path: params.storagePath,
      mime: params.mime || null,
      size_bytes: params.sizeBytes ?? null,
      duration_sec: params.durationSec ?? null,
      checksum: params.checksum || null,
      created_at: new Date().toISOString(),
    }
    const { data, error } = await getSupabase().from('media_assets').insert([payload]).select().single()
    if (error) throw error
    return {
      id: data.id,
      mediaId: data.media_id,
      storagePath: data.storage_path,
      publicUrl: data.public_url,
      mime: data.mime || 'application/octet-stream',
      sizeBytes: data.size_bytes || 0,
      width: null,
      height: null,
      durationSec: data.duration_sec || null,
      checksum: data.checksum || '',
      kind: (data.kind as any) || undefined,
    } as Asset
  },
  async deleteAsset(assetId: string) {
    const { error } = await getSupabase().from('media_assets').delete().eq('id', assetId)
    if (error) throw error
    return { success: true }
  },
};

export const taxonomyService = {
  async getTaxonomies() {
    return [] as Taxonomy[];
  },
  async getMediaTaxonomies(_id: string) {
    return [] as string[];
  },
  async assignTaxonomy(_id: string, _taxId: string) {
    return { success: true };
  },
  async removeTaxonomy(_id: string, _taxId: string) {
    return { success: true };
  },
};

export const submissionService = {
  async getSubmissionsByMediaId(_id: string) {
    return [] as Submission[];
  },
  async createSubmission(_id: string) {
    return { success: true };
  },
};

export const auditService = {
  async getAuditLogs(_id: string) {
    return [] as AuditLog[];
  },
  async createAuditLog(_log: Partial<AuditLog>) {
    return { success: true };
  },
};
