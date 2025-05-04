import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const createUser = async (formData) => {
  try {
    const url = `${getBaseUrl()}/api/users/`;
    
    // Send formData as payload
    const response = await axios.post(url, formData); 
    
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    const errorData = error.response ? error.response.data : { message: "Network error" };
    const errorStatus = error.response ? error.response.status : 500;

    return {
      success: false,
      data: errorData,
      status: errorStatus,
    };
  }
};
