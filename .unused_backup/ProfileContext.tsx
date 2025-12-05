"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookie from "js-cookie";
import axios, { AxiosError } from "axios";
import { ContactData,ProfileContextValue, FirmData } from "../types";

// Import the ContactData type from types to ensure consistency


// Local type extension if needed
interface ExtendedContactData extends ContactData {
  // Add any additional properties specific to this context
  [key: string]: any;
}

// Create ProfileContext with proper type
export const ProfileContext = createContext<ProfileContextValue | null>(null);

// Custom hook to use the ProfileContext
export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
};

// Helper function to check token expiry based on 'expires_in'
const isTokenExpired = (
  token: string | null,
  tokenTimestamp: number | null
) => {
  if (!token || !tokenTimestamp) return true;

  const currentTime = Date.now();
  return currentTime > tokenTimestamp;
};

// ProfileProvider component
export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [firmdata, setFirmdata] = useState<FirmData[]>([]);
  const [contactdata, setContactdata] = useState<ExtendedContactData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  console.log("mytoken",token)

  // Function to get contact data
  const getAccounContact = useCallback(async (accountid?: string) => {
    if (!accountid) return null;

    try {
      setError(null);
      const response = await axios.post<{ value: ExtendedContactData[] }>(
        "/api/getcontact",
        {
          params: { accountid },
        }
      );
      const firstContact = response?.data?.value?.[0] ?? null;
      setContactdata(firstContact ? { ...firstContact } : null);
      return firstContact;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch contact data";
      setError(errorMessage);
      console.error("Error fetching contact:", error);
      return null;
    }
  }, []);

  // Function to get firm data
  const getFirmdata = useCallback(async () => {
    if (!token) return [];
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await axios.get<{
        value: Array<FirmData & { _primarycontactid_value?: string }>;
      }>("/api/profileapi");
      const firmData = data?.value ?? [];
      setFirmdata(firmData);

      // Fetch contact data if primary contact ID is available
      const primaryContactId = firmData[0]?._primarycontactid_value;
      if (primaryContactId) {
        await getAccounContact(primaryContactId);
      }
      return firmData;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch firm data";
      setError(errorMessage);
      console.error("Error fetching firm data:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [token, getAccounContact]);

  // Load token from cookies on initial load
  useEffect(() => {
    const savedToken = Cookie.get("authToken");
    const savedTimestamp = Number(Cookie.get("authTokenTimestamp"));
    if (savedToken && !isTokenExpired(savedToken, savedTimestamp)) {
      setTokenState(savedToken);
    } else {
      console.log("getting new token")
      fetchNewToken();
    }
  }, []);

  // Fetch a new token from the API if expired or not available
  const fetchNewToken = async () => {
    try {
      const response = await axios.post("https://kfexpressserver.vercel.app/api/v1/auth/get-token");
      const data = response.data;
      console.log("token data",data)
      if (data && data?.tokenresponse?.access_token) {
        console.log("Token fetched successfully", data?.tokenresponse?.access_token);
        const tokenExpiryTimestamp = Date.now() + data?.tokenresponse?.expires_in * 1000; // Calculate the expiry time based on `expires_in`
        setTokenAndSave(data?.tokenresponse?.access_token, tokenExpiryTimestamp);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error fetching token:",
          error.response?.data || error.message
        );
      } else {
        console.error("Error fetching token:", error);
      }
    }
  };

  // Set token and expiration timestamp, save to cookies
  const setTokenAndSave = (
    newToken: string | null,
    expiryTimestamp: number
  ) => {
    if (newToken) {
      // Set the cookie expiration based on the `expires_in` value (not a fixed 7 days)
      Cookie.set("authToken", newToken, {
        expires: expiryTimestamp / (1000 * 60 * 60 * 24),
      }); // Convert ms to days
      Cookie.set("authTokenTimestamp", expiryTimestamp.toString(), {
        expires: expiryTimestamp / (1000 * 60 * 60 * 24),
      });
    } else {
      Cookie.remove("authToken");
      Cookie.remove("authTokenTimestamp");
    }
    setTokenState(newToken); // Only pass the token to the setter
  };

  // Custom setToken function with proper type signature
  const setToken = React.useCallback((token: string | null) => {
    setTokenState(token);
    // Clear data when token is removed
    if (!token) {
      setFirmdata([]);
      setContactdata(null);
    }
  }, []);

  // Fetch firm data after token is available and valid
  useEffect(() => {
    const authTokenTimestamp = Cookie.get("authTokenTimestamp");
    if (
      token &&
      !isTokenExpired(
        token,
        authTokenTimestamp ? Number(authTokenTimestamp) : null
      )
    ) {
      getFirmdata();
    }
  }, [token, getFirmdata]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue: ProfileContextValue = React.useMemo(
    () => ({
      token,
      setToken,
      firmdata,
      contactdata: contactdata || {
        contactid: "",
        fullname: "",
        emailaddress1: "",
        telephone1: "",
        jobtitle: "",
        address2_telephone1: "",
        address1_city: "",
        firstname: "",
        lastname: "",
        mspp_userpreferredlcid: 0,
        annualincome: 0,
      },
      isLoading,
      error,
      refreshData: getFirmdata,
    }),
    [token, firmdata, contactdata, isLoading, error, getFirmdata]
  );

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};