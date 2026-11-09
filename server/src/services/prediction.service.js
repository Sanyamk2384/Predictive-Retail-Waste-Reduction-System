import env from "../config/env.js";

export const requestProductPrediction = async (body = {}) => {
  let response;
  try {
    response = await fetch(`${env.ai_service_url}/predict/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw Object.assign(
      new Error("Prediction service is unreachable. Make sure the AI service is running."),
      { status: 502 },
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.detail || payload?.message || "Prediction service request failed";
    throw Object.assign(new Error(message), { status: response.status });
  }

  return payload;
};
