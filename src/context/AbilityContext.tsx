import { createContext, ReactNode, useContext, useMemo } from "react";
import { createContextualCan } from "@casl/react";
import { useMsal } from "@azure/msal-react";
import { AppAbility, defineAbilityFor, Role } from "../config/abilities";
import { ALLOWED_ROLES } from "../config/abilities";

interface AbilityContextType {
  ability: AppAbility;
  role: Role | undefined;
  currentUserId?: string;
}

const defaultAbility = defineAbilityFor(undefined);
export const CASLAbilityContext = createContext<AppAbility>(defaultAbility);
export const Can = createContextualCan(CASLAbilityContext.Consumer);

const AbilityContext = createContext<AbilityContextType | undefined>(undefined);

export function AbilityProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { instance } = useMsal();

  const role = useMemo((): Role | undefined => {
    try {
      const account = instance.getActiveAccount();
      if (!account?.idTokenClaims) return undefined;
      const claims: any = account.idTokenClaims;
      const rawRole = claims?.extension_role || claims?.role || claims?.roles?.[0] || claims?.appRole;
      if (!rawRole) return undefined;
      const normalizedRole = typeof rawRole === "string" ? (rawRole.toLowerCase().trim() as Role) : undefined;
      if (normalizedRole && ALLOWED_ROLES.includes(normalizedRole)) return normalizedRole;
      return undefined;
    } catch {
      return undefined;
    }
  }, [instance]);

  const currentUserId = useMemo(() => {
    try {
      const account = instance.getActiveAccount();
      const id = (account as any)?.localAccountId || (account as any)?.homeAccountId;
      return typeof id === 'string' ? id : undefined;
    } catch {
      return undefined;
    }
  }, [instance]);

  const ability = useMemo(() => defineAbilityFor(role, currentUserId), [role, currentUserId]);

  const contextValue: AbilityContextType = useMemo(
    () => ({ ability, role, currentUserId }),
    [ability, role, currentUserId]
  );

  return (
    <CASLAbilityContext.Provider value={ability}>
      <AbilityContext.Provider value={contextValue}>{children}</AbilityContext.Provider>
    </CASLAbilityContext.Provider>
  );
}

export function useAbilityContext() {
  const context = useContext(AbilityContext);
  if (context === undefined) {
    throw new Error("useAbilityContext must be used within an AbilityProvider");
  }
  return context;
}
