import { gql } from '@apollo/client';

// GraphQL Mutations and Queries
export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ... on CurrentUser {
        id
        identifier
        channels {
          id
          code
          token
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const SUBMIT_ENQUIRY_MUTATION = gql`
  mutation SubmitEnquiry(
    $firstName: String!
    $lastName: String!
    $email: String!
    $phoneNumber: String!
    $additionalMessage: String!
    $serviceEnquiryType: String!
  ) {
    submitEnquiry(
      firstName: $firstName
      lastName: $lastName
      email: $email
      phoneNumber: $phoneNumber
      additionalMessage: $additionalMessage
      serviceEnquiryType: $serviceEnquiryType
    ) {
      success
      message
    }
  }
`;

export const CREATE_CUSTOMER_MUTATION = gql`
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      ... on Customer {
        id
        firstName
        lastName
        emailAddress
        phoneNumber
        customFields {
          additionalMessage
          serviceEnquiryType
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const UPDATE_CUSTOMER_MUTATION = gql`
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      ... on Customer {
        id
        firstName
        lastName
        emailAddress
        phoneNumber
        customFields {
          additionalMessage
          serviceEnquiryType
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const GET_CUSTOMER_BY_EMAIL = gql`
  query GetCustomerByEmail($emailAddress: String!) {
    customers(options: { filter: { emailAddress: { eq: $emailAddress } } }) {
      items {
        id
        firstName
        lastName
        emailAddress
        phoneNumber
      }
    }
  }
`;