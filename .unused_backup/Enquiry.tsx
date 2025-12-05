import React, { useState } from 'react';
import {
  ContentWrapper,
  ContentColumn,
  StyledHeader,
  StyledBody,
  Description,
  HelpLink,
  FeatureContainer,
  FeatureItem,
  FormColumn,
  FormRow,
  FormFieldWrapper,
  FormLabel,
  FormField,
  FormSelectWrapper,
  FormSelect,
  FormTextareaWrapper,
  FormTextarea,
  PrivacyText,
  PrivacyLink,
  SubmitButton,
  AlertPopup,
  AlertHeader,
  AlertText,
  AlertClose,
} from './styles';

// GraphQL Mutations and Query
const LOGIN_MUTATION = `
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

const SUBMIT_ENQUIRY_MUTATION = `
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

const CREATE_CUSTOMER_MUTATION = `
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

const UPDATE_CUSTOMER_MUTATION = `
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

const GET_CUSTOMER_BY_EMAIL = `
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

// Define props interface for the component
interface EnquiryProps {
  id?: string;
}

export const Enquiry: React.FC<EnquiryProps> = ({ id }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    enquiryType: "",
    message: "",
  });
  const [showAlert, setShowAlert] = useState<null | true | "error">(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertHeader, setAlertHeader] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return (
      formData.firstName.match(/^[A-Za-z]+$/) &&
      formData.lastName.match(/^[A-Za-z]+$/) &&
      isValidEmail(formData.email) &&
      formData.phoneNumber.match(/^[0-9]{1,11}$/) &&
      [
        "Funding Request",
        "Mentorship",
        "Business Consultation",
        "Event Registration",
        "Legal or Compliance",
        "Product/Service Inquiry",
        "Technical Support",
        "General Inquiry",
        "Feedback/Suggestions",
        "Partnership/Collaboration",
      ].includes(formData.enquiryType) &&
      formData.message.trim() !== ""
    );
  };

  const handleHelpLinkClick = () => {
    window.location.href = "/faq"; // Replace with React Router if integrated
  };

  const handlePrivacyLinkClick = () => {
    window.location.href = "/development"; // Replace with React Router if integrated
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      let errorMessage = "❌ Please correct the following issues:\n";
      if (!formData.firstName.match(/^[A-Za-z]+$/)) {
        errorMessage += "- First name must contain only letters.\n";
      }
      if (!formData.lastName.match(/^[A-Za-z]+$/)) {
        errorMessage += "- Last name must contain only letters.\n";
      }
      if (!isValidEmail(formData.email)) {
        errorMessage += "- Email must be a valid format (e.g., user@example.com).\n";
      }
      if (!formData.phoneNumber.match(/^[0-9]{1,11}$/)) {
        errorMessage += "- Phone number must contain only 1-11 digits.\n";
      }
      if (![
        "Funding Request",
        "Mentorship",
        "Business Consultation",
        "Event Registration",
        "Legal or Compliance",
        "Product/Service Inquiry",
        "Technical Support",
        "General Inquiry",
        "Feedback/Suggestions",
        "Partnership/Collaboration",
      ].includes(formData.enquiryType)) {
        errorMessage += "- Please select a valid enquiry type from the list.\n";
      }
      if (formData.message.trim() === "") {
        errorMessage += "- Message cannot be empty or contain only whitespace.\n";
      }
      setAlertHeader("Validation Error");
      setAlertMessage(errorMessage);
      setShowAlert("error");
      setTimeout(() => setShowAlert(null), 3000);
      return;
    }

    setIsSubmitting(true);
    console.log("Form submitted with data:", formData);

    if (!formData.enquiryType) {
      setAlertMessage("❌ Please select a valid enquiry type.");
      setShowAlert("error");
      setTimeout(() => setShowAlert(null), 3000);
      setIsSubmitting(false);
      return;
    }

    try {
      const submitResponse = await fetch(
        "https://9609a7336af8.ngrok-free.app/admin-api",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: SUBMIT_ENQUIRY_MUTATION,
            variables: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
              additionalMessage: formData.message,
              serviceEnquiryType: formData.enquiryType,
            },
          }),
        }
      );

      const submitData = await submitResponse.json();
      console.log(
        "SubmitEnquiry mutation response:",
        JSON.stringify(submitData, null, 2)
      );

      if (submitData?.data?.submitEnquiry?.success) {
        setAlertHeader("Enquiry Submitted Successfully!");
        setAlertMessage(
          submitData.data.submitEnquiry.message ||
            "Thank you! Your Enquiry has been submitted successfully. We'll get back to you soon."
        );
        setShowAlert(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          enquiryType: "",
          message: "",
        });
        setIsSubmitting(false);
        setTimeout(() => setShowAlert(null), 5000);
        return;
      }

      console.log(
        "SubmitEnquiry mutation failed, falling back to original logic"
      );

      const loginResponse = await fetch(
        "https://9609a7336af8.ngrok-free.app/admin-api",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: LOGIN_MUTATION,
            variables: {
              username: "superadmin",
              password: "superadmin",
            },
          }),
        }
      );

      const loginData = await loginResponse.json();
      const authToken = loginResponse.headers.get("vendure-auth-token");

      if (!authToken || loginData?.data?.login?.__typename === "ErrorResult") {
        console.error("Login failed:", loginData);
        setAlertHeader("Authentication Error");
        setAlertMessage("❌ Failed to authenticate with Vendure Admin API.");
        setShowAlert("error");
        setTimeout(() => setShowAlert(null), 3000);
        setIsSubmitting(false);
        return;
      }

      console.log("Authenticated successfully with token:", authToken);

      const checkCustomerResponse = await fetch(
        "https://9609a7336af8.ngrok-free.app/admin-api",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            query: GET_CUSTOMER_BY_EMAIL,
            variables: {
              emailAddress: formData.email,
            },
          }),
        }
      );

      const checkCustomerData = await checkCustomerResponse.json();
      console.log(
        "Customer check response:",
        JSON.stringify(checkCustomerData, null, 2)
      );

      let payload;
      let isUpdate = false;

      if (checkCustomerData?.data?.customers?.items?.length > 0) {
        const existingCustomer = checkCustomerData.data.customers.items[0];
        isUpdate = true;
        const timestamp = new Date().toISOString();
        const enquiryId = `${formData.enquiryType}-${timestamp}`;
        payload = {
          query: UPDATE_CUSTOMER_MUTATION,
          variables: {
            input: {
              id: existingCustomer.id,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phoneNumber: formData.phoneNumber,
              customFields: {
                additionalMessage: `[${enquiryId}] ${formData.message}`,
                serviceEnquiryType: formData.enquiryType,
              },
            },
          },
        };
        console.log("Updating existing customer:", payload);
      } else {
        payload = {
          query: CREATE_CUSTOMER_MUTATION,
          variables: {
            input: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              emailAddress: formData.email,
              phoneNumber: formData.phoneNumber,
              customFields: {
                additionalMessage: formData.message,
                serviceEnquiryType: formData.enquiryType,
              },
            },
          },
        };
        console.log("Creating new customer:", payload);
      }

      const response = await fetch(
        "https://9609a7336af8.ngrok-free.app/admin-api",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log(
        `${isUpdate ? "Update" : "Create"}Customer mutation response:`,
        JSON.stringify(data, null, 2)
      );

      const customerData = isUpdate
        ? data?.data?.updateCustomer
        : data?.data?.createCustomer;

      if (data.errors && Array.isArray(data.errors)) {
        setAlertHeader("Submission Error");
        setAlertMessage("❌ Submission failed: " + data.errors[0].message);
        setShowAlert("error");
        console.group("🛑 GraphQL Errors");
        data.errors.forEach((error: any, index: number) => {
          console.error(`Error ${index + 1}:`, error.message);
        });
        console.groupEnd();
      } else if (customerData?.id || customerData?.__typename === "Customer") {
        setAlertHeader("Enquiry Submitted Successfully!");
        setAlertMessage(
          `Thank you! Your Enquiry has been ${
            isUpdate ? "updated" : "submitted"
          } successfully. We'll get back to you soon.`
        );
        setShowAlert(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          enquiryType: "",
          message: "",
        });
      } else if (customerData?.__typename === "ErrorResult") {
        setAlertHeader("Submission Error");
        if (customerData.errorCode === "EMAIL_ADDRESS_CONFLICT_ERROR") {
          setAlertMessage(
            "⚠️ An enquiry with this email already exists. Please use a different email or contact us directly."
          );
        } else {
          setAlertMessage(`⚠️ ${customerData.message}`);
        }
        setShowAlert("error");
      } else {
        console.error(
          "Unexpected response structure:",
          JSON.stringify(data, null, 2)
        );
        setAlertHeader("Submission Error");
        setAlertMessage(
          "⚠️ Unexpected response from server. Please try again."
        );
        setShowAlert("error");
      }
    } catch (error) {
      console.error("Network/GraphQL error:", error);
      setAlertHeader("Network Error");
      setAlertMessage("🚫 Network error. Please try again later.");
      setShowAlert("error");
    } finally {
      setIsSubmitting(false);
    }

    setTimeout(() => setShowAlert(null), 5000);
  };

  return (
    <div id={id}>
      <div style={{ width: '100%', padding: '0', margin: '0' }}>
        {showAlert && (
          <AlertPopup>
            <AlertHeader>{alertHeader}</AlertHeader>
            <AlertText>{alertMessage}</AlertText>
            <AlertClose onClick={() => setShowAlert(null)}>×</AlertClose>
          </AlertPopup>
        )}
        <ContentWrapper>
          <ContentColumn>
            <StyledHeader>CONTACT OUR TEAM</StyledHeader>
            <StyledBody>Ready to Make an Enquiry?</StyledBody>
            <Description>
              Tell us what you're looking for and we'll get back to you shortly.
              For additional information you can also visit our{" "}
              <HelpLink onClick={handleHelpLinkClick}>Help Center</HelpLink>.
            </Description>
            <FeatureContainer>
              <FeatureItem>
                <span>✓</span> 500+ Tailored Services
              </FeatureItem>
              <FeatureItem>
                <span>✓</span> AI Support for Every Stage of Your Business
              </FeatureItem>
              <FeatureItem>
                <span>✓</span> Simplified access, all in one place
              </FeatureItem>
              <FeatureItem>
                <span>✓</span> Support that grows with your business
              </FeatureItem>
            </FeatureContainer>
          </ContentColumn>

          <FormColumn onSubmit={handleSubmit}>
            <FormRow>
              <FormFieldWrapper>
                <FormLabel>First Name</FormLabel>
                <FormField
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  pattern="[A-Za-z]+"
                  title="First name should only contain letters"
                />
              </FormFieldWrapper>
              <FormFieldWrapper>
                <FormLabel>Last Name</FormLabel>
                <FormField
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  pattern="[A-Za-z]+"
                  title="Last name should only contain letters"
                />
              </FormFieldWrapper>
            </FormRow>

            <FormRow>
              <FormFieldWrapper>
                <FormLabel>Email</FormLabel>
                <FormField
                  type="email"
                  name="email"
                  placeholder="johndoe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  title="Please enter a valid email address"
                />
              </FormFieldWrapper>
              <FormFieldWrapper>
                <FormLabel>Phone number</FormLabel>
                <FormField
                  type="tel"
                  name="phoneNumber"
                  placeholder="+971 xxx xxxx"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{1,11}"
                  maxLength={20}
                  title="Phone number should only contain numbers and be up to 11 characters"
                />
              </FormFieldWrapper>
            </FormRow>

            <FormRow>
              <FormSelectWrapper>
                <FormLabel>Select Enquiry Type</FormLabel>
                <FormSelect
                  name="enquiryType"
                  value={formData.enquiryType}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Funding Request">Funding Request</option>
                  <option value="Mentorship">Mentorship</option>
                  <option value="Business Consultation">
                    Business Consultation
                  </option>
                  <option value="Event Registration">Event Registration</option>
                  <option value="Legal or Compliance">Legal or Compliance</option>
                  <option value="Product/Service Inquiry">
                    Product/Service Inquiry
                  </option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Feedback/Suggestions">
                    Feedback/Suggestions
                  </option>
                  <option value="Partnership/Collaboration">
                    Partnership/Collaboration
                  </option>
                </FormSelect>
              </FormSelectWrapper>
            </FormRow>

            <FormRow>
              <FormTextareaWrapper>
                <FormLabel>Message</FormLabel>
                <FormTextarea
                  name="message"
                  placeholder="Describe your enquiry in detail"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </FormTextareaWrapper>
            </FormRow>

            <PrivacyText>
              <span style={{ color: "#FF4C51" }}>*</span> By submitting this form,
              you agree to our{" "}
              <PrivacyLink onClick={handlePrivacyLinkClick}>
                Privacy Policy
              </PrivacyLink>
              .
            </PrivacyText>

            <SubmitButton type="submit" disabled={!isFormValid() || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Enquiry"}
            </SubmitButton>
          </FormColumn>
        </ContentWrapper>
      </div>
    </div>
  );
};

export default Enquiry;