import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const getPaymentOrder = async (userId,addressId , paymentMode) => {
    try {
      // const userId=1
      // const addressId=3
      const url = `${getBaseUrl()}/api/place-order/${userId}/${addressId}?paymentMode=${paymentMode}`;
      const response = await axios.post(url)
      console.log(response.data)
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