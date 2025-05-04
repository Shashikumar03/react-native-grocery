
import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const sendOtp = async (mobile) => {
    try {
        const userId=1
        const addressId=3
        const url = `${getBaseUrl()}/sms/sendOtp?to=${mobile}`;
        const response = await axios.post(url)
        // console.log(response.data)
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

export const verifyOtp = async (mobile, code) => {

    try {
      
        const url = `${getBaseUrl()}/sms/verifyOtp?to=${mobile}&code=${code}`;
        const response = await axios.post(url)
        // console.log(response.data)
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
export const resendOtp = async () => {

    try {
      
        const url = `${getBaseUrl()}/sms/resend-otp?phone=+917073052300`;
        const response = await axios.post(url)
        // console.log(response.data)
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

