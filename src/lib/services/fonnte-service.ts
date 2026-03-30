/**
 * Fonnte WhatsApp Service
 * 
 * Documentation: https://fonnte.com/
 */

export type FonnteResponse = {
  status: boolean;
  message: string;
};

class FonnteService {
  private token: string;
  private baseUrl = "https://api.fonnte.com/send";

  constructor() {
    this.token = (process.env.FONNTE_TOKEN || "").trim();
  }

  /**
   * Send a WhatsApp message via Fonnte
   * 
   * @param target - Recipient phone number (e.g., 628123...)
   * @param message - The message content
   */
  async sendMessage(target: string, message: string): Promise<FonnteResponse> {
    if (!this.token || this.token === "YOUR_FONNTE_TOKEN_HERE") {
      console.warn("[FonnteService] TOKEN is not configured. Message not sent.");
      return { status: false, message: "Token not configured" };
    }

    try {
      const formData = new FormData();
      formData.append("target", target);
      formData.append("message", message);
      formData.append("countryCode", "62");

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: this.token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FonnteService] HTTP Error ${response.status}: ${errorText}`);
        return { status: false, message: `Fonnte API returned ${response.status}` };
      }

      const data = await response.json();
      
      if (!data || data.status === undefined) {
        console.error("[FonnteService] Invalid response format:", JSON.stringify(data));
        return { status: false, message: "Invalid API response" };
      }

      if (!data.status) {
        const errorDetail = data.message || data.reason || "Unknown error";
        console.error(`[FonnteService] Failed to send message: ${errorDetail}`, JSON.stringify(data));
      } else {
        console.log(`[FonnteService] Message sent successfully to ${target}`);
      }

      return {
        status: !!data.status,
        message: data.message || data.reason || (data.status ? "Success" : "Failed"),
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[FonnteService] service error: ${errorMsg}`);
      return {
        status: false,
        message: "An error occurred in Fonnte service",
      };
    }
  }
}

export const fonnteService = new FonnteService();
