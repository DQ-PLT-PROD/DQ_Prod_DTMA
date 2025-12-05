import styled from 'styled-components';

export const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  padding: 60px 80px;
  min-height: 100vh;

  @media (max-width: 1199px) {
    padding: 32px 24px;
    gap: 2.5rem;
    min-height: auto;
  }

  @media (max-width: 899px) {
    flex-direction: column;
    padding: 24px 16px;
    gap: 2rem;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
    gap: 1.5rem;
  }
`;

export const ContentColumn = styled.div`
  color: #000;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  width: 50%;

  @media (max-width: 1199px) {
    flex: 0 0 50%;
  }

  @media (max-width: 899px) {
    flex: 1;
    margin-bottom: 0;
    text-align: center;
    align-items: center;
  }

  @media (max-width: 480px) {
    text-align: left;
    align-items: flex-start;
  }
`;

export const StyledHeader = styled.p`
  color: var(--KF-BG-Black, #000);
  font-size: 16px;
  font-weight: 400;
  line-height: 28px;
  letter-spacing: 0px;
  text-transform: uppercase;
  margin: 0 0 8px 0;

  @media (max-width: 1199px) {
    font-size: 15px;
    line-height: 26px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    line-height: 24px;
  }
`;

export const StyledBody = styled.h1`
  color: #000;
  font-size: 48px;
  font-style: normal;
  font-weight: 400;
  line-height: 52px;
  letter-spacing: 0px;
  margin: 0 0 16px 0;

  @media (max-width: 1199px) {
    font-size: 36px;
    line-height: 40px;
  }

  @media (max-width: 899px) {
    font-size: 32px;
    line-height: 36px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
    line-height: 32px;
    margin-bottom: 12px;
  }
`;

export const Description = styled.p`
  color: var(--KF-BG-Black, #000);
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  margin-bottom: 24px;

  @media (max-width: 1199px) {
    font-size: 15px;
    line-height: 22px;
    margin-bottom: 20px;
  }

  @media (max-width: 899px) {
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    line-height: 22px;
    text-align: left;
    margin-bottom: 20px;
  }
`;

export const HelpLink = styled.a`
  color: #0030e3;
  text-decoration: underline;
  cursor: pointer;
`;

export const FeatureContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 40px;

  @media (max-width: 1199px) {
    margin-top: 24px;
    gap: 10px;
  }

  @media (max-width: 899px) {
    align-items: center;
    margin-top: 20px;
  }

  @media (max-width: 480px) {
    align-items: flex-start;
    margin-top: 16px;
  }
`;

export const FeatureItem = styled.div`
  color: #0030e3;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 1199px) {
    font-size: 15px;
  }

  @media (max-width: 899px) {
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    text-align: left;
  }
`;

export const FormColumn = styled.form`
  display: flex;
  flex: 1;
  width: 50%;
  min-height: 550px;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  align-self: flex-start;

  @media (max-width: 1199px) {
    min-height: auto;
    padding: 20px;
    gap: 18px;
    flex: 0 0 auto;
  }

  @media (max-width: 899px) {
    padding: 20px;
    gap: 16px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    gap: 16px;
    border-radius: 6px;
  }
`;

export const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 0;
  width: 100%;

  @media (max-width: 1199px) {
    gap: 14px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export const FormFieldWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  @media (max-width: 1199px) {
    gap: 5px;
  }

  @media (max-width: 480px) {
    gap: 4px;
  }
`;

export const FormLabel = styled.label`
  font-size: 14px;
  color: #000;
  font-weight: 500;

  @media (max-width: 1199px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const FormField = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: "FS Kim Trial";
  font-size: 16px;
  color: #000;
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0030e3;
    box-shadow: 0 0 0 2px rgba(0, 48, 227, 0.1);
  }

  @media (max-width: 1199px) {
    padding: 10px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    font-size: 16px;
  }
`;

export const FormSelectWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 1199px) {
    gap: 5px;
  }

  @media (max-width: 480px) {
    gap: 4px;
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #000;
  background-color: #fff;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0030e3;
    box-shadow: 0 0 0 2px rgba(0, 48, 227, 0.1);
  }

  @media (max-width: 1199px) {
    padding: 10px;
    padding-right: 35px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    padding-right: 35px;
    font-size: 16px;
  }
`;

export const FormTextareaWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 1199px) {
    gap: 5px;
  }

  @media (max-width: 480px) {
    gap: 4px;
  }
`;

export const FormTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  height: 120px;
  padding: 12px;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: "FS Kim Trial";
  font-size: 16px;
  color: #000;
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0030e3;
    box-shadow: 0 0 0 2px rgba(0, 48, 227, 0.1);
  }

  @media (max-width: 1199px) {
    padding: 10px;
    font-size: 14px;
    height: 100px;
    min-height: 80px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    font-size: 16px;
    min-height: 80px;
    height: 100px;
  }
`;

export const PrivacyText = styled.p`
  color: #666;
  font-size: 16px;
  font-family: "FS Kim Trial";
  font-weight: 400;
  line-height: 18px;
  margin: 0;

  @media (max-width: 1199px) {
    font-size: 16px;
    line-height: 16px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    line-height: 16px;
  }
`;

export const PrivacyLink = styled.a`
  color: #5088ff;
  font-size: 16px;
  font-family: "FS Kim Trial";
  font-weight: 400;
  line-height: 18px;
  text-decoration-line: underline;
  cursor: pointer;

  @media (max-width: 1199px) {
    font-size: 16px;
    line-height: 16px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    line-height: 16px;
  }
`;

export const SubmitButton = styled.button<{ disabled?: boolean }>`
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#0030E3")};
  color: #fff;
  padding: 14px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  width: auto;
  min-width: 140px;
  align-self: flex-start;
  transition: all 0.2s ease;

  &:not(:disabled):hover {
    background-color: #0026cc;
    transform: translateY(-1px);
  }

  &:not(:disabled):active {
    transform: translateY(0);
  }

  @media (max-width: 1199px) {
    padding: 12px 20px;
    font-size: 15px;
    min-width: 120px;
    width: auto;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 20px;
    font-size: 16px;
    min-width: auto;
    align-self: stretch;
  }
`;

export const AlertPopup = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 400px;
  z-index: 1000;
  text-align: center;

  @media (max-width: 480px) {
    top: 10px;
    width: 95%;
    max-width: none;
    margin: 0 10px;
    padding: 12px;
    border-radius: 6px;
  }
`;

export const AlertHeader = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #555;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 8px;
  }
`;

export const AlertText = styled.div`
  color: #555;
  font-size: 14px;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const AlertClose = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    width: 20px;
    height: 20px;
    top: 6px;
    right: 6px;
  }
`;