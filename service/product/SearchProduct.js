import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";
// import { getBaseUrl } from "../../constants/Baseurl";

export const searchProduct = async (productName = "", category = "") => {
    try {
        const queryParams = new URLSearchParams();

        if (productName) queryParams.append("name", productName);
        if (category) queryParams.append("category", category);

        // Always include minPrice and maxPrice (if needed, you can make them optional too)
        queryParams.append("minPrice", "");
        queryParams.append("maxPrice", "");

        const url = `${getBaseUrl()}/api/product/search?${queryParams.toString()}`;
        // getBaseUrl
        const response = await axios.get(url);
        console.log("search product api", response.data);

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
