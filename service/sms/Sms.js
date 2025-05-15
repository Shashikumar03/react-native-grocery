
import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const sendOtp = async (mobile) => {
    try {
        console.log(mobile)
        const url = `${getBaseUrl()}/sms/sendOtp?to=${mobile}`;
        console.log(url)
        const response = await axios.post(url)
        console.log("send otp resposne",response.data)
        return {
            success: true,
            data: response.data,
            status: response.status,
        }
  
      } catch (error) {
        console.log("send otp error",error.response.data)
        const errorData = error.response ? error.response.data : { message: "Network error" };
        const errorStatus = error.response ? error.response.status : 500;
  
        return {
            success: false,
            data: errorData,
            status: errorStatus,
        }
      }
}

export const verifyOtp = async (mobile, code) => {

    try {
      
        const url = `${getBaseUrl()}/sms/verifyOtp?to=${mobile}&code=${code}`;
        const response = await axios.post(url)
        console.log("verify otp response",response.data)
        return {
            success: true,
            data: response.data,
            status: response.status,
        }
  
      } catch (error) {
        const errorData = error.response ? error.response.data : { message: "Network error" };
        const errorStatus = error.response ? error.response.status : 500;
  
        return {
            success: false,
            data: errorData,
            status: errorStatus,
        }
      }

}
// sms/resend-otp?phone=+917073052300
export const resendOtp = async (mobile) => {
    console.log(mobile)
    try {
      
        const url = `${getBaseUrl()}/sms/resend-otp?phone=${mobile}`;
        const response = await axios.post(url)
        console.log("resend otp response",response.data)
        return {
            success: true,
            data: response.data,
            status: response.status,
        }
  
      } catch (error) {
        const errorData = error.response ? error.response.data : { message: "Network error" };
        const errorStatus = error.response ? error.response.status : 500;
        console.log(errorData)
  
        return {
            success: false,
            data: errorData,
            status: errorStatus,
        }
      }
}

