import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const addProductToCart = async ( userId,productId, quantity) => {
    try {
        const url = `${getBaseUrl()}/api/v1/carts/${userId}/add`;

        // Define the payload to be sent in the POST request
        const payload = {
            productId: productId,
            quantity: quantity,
        };

        const response = await axios.post(url, payload); 
        console.log("add product to card response :", response.data)
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
}
