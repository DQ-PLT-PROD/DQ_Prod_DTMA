// Remove dependency on graphql-request and implement a simple mock client
// import { GraphQLClient } from 'graphql-request'
import { getMarketplaceConfig } from "../../utils/marketplaceConfig";
import { getCourses, getCourseBySlug, getRelatedCourses, toMarketplaceItem } from "../../lib/api/dtmaCourses";

// Create a simple mock GraphQL client since we don't have access to graphql-request
const mockGraphQLClient = {
  request: async (query: string, variables: any = {}) => {
    console.log("Mock GraphQL request:", {
      query,
      variables,
    });
    // Return mock data based on the query
    return getMockResponse(query, variables);
  },
};

// Expose as graphqlClient for backward compatibility
export const graphqlClient = mockGraphQLClient;

// Fallback function for when API calls fail or during development
export const getMockResponse = (
  queryName: string,
  variables: any,
  marketplaceType?: string
) => {
  console.log(`Using mock data fallback for query: ${queryName}`);

  // If marketplaceType is provided, use the mockData from the config
  if (marketplaceType) {
    try {
      const config = getMarketplaceConfig(marketplaceType);
      if (config.mockData) {
        // Handle different query types
        if (queryName.includes("getItems")) {
          return {
            items: config.mockData.items,
          };
        }
        if (queryName.includes("getItemDetails") && variables.id) {
          const item = config.mockData.items.find(
            (item: any) => item.id === variables.id
          );
          return {
            item,
          };
        }
        if (queryName.includes("getRelatedItems")) {
          const relatedItems = config.mockData.items
            .filter(
              (item: any) =>
                item.id !== variables.id &&
                (item.category === variables.category ||
                  item.provider.name === variables.provider)
            )
            .slice(0, 3);
          return {
            relatedItems,
          };
        }
        if (queryName.includes("getFilterOptions")) {
          return {
            filterOptions: config.mockData.filterOptions,
          };
        }
        if (queryName.includes("getProviders")) {
          return {
            providers: config.mockData.providers,
          };
        }
      }
    } catch (error) {
      console.error(`Error getting mock data for ${marketplaceType}:`, error);
    }
  }

  // Legacy fallback for courses now backed by DTMA mock data
  if (queryName.includes("getCourseDetails") && variables.id) {
    const course = getCourseBySlug(variables.id);
    return {
      course,
    };
  }
  if (queryName.includes("getRelatedCourses")) {
    const filteredCourses = getRelatedCourses(variables.id).map(toMarketplaceItem);
    return {
      relatedCourses: filteredCourses,
    };
  }

  // Default fallback
  return {
    items: getCourses().map(toMarketplaceItem),
  };
};

// Enhanced request function with error handling and mock fallback
export const request = async <T>(
  query: string,
  variables: any = {},
  queryName: string = "unknown",
  marketplaceType?: string
): Promise<T> => {
  try {
    const data = await mockGraphQLClient.request(query, variables);
    return data as T;
  } catch (error) {
    console.error(`GraphQL request error for ${queryName}:`, error);
    // Use mock data as fallback
    return getMockResponse(queryName, variables, marketplaceType) as T;
  }
};
