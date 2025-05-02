import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const getUserById = async (userId) => {
  try {
    const url = `${getBaseUrl()}/api/users/${userId}`;

    const response = await axios.get(url);
    console.log("GetUserById",response.data)
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
