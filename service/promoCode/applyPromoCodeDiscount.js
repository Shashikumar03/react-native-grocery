import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const applyPromoCodeDiscount = async (cartId,discountAmount) => {
    try {
      
      const url = `${getBaseUrl()}/api/v1/carts/${cartId}/discount?discount=${discountAmount}`;
      const response = await axios.put(url)
      console.log("promode discount response", response.data)
      console.log("discount amount will be: ",discountAmount)
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