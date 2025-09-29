import { json } from "@remix-run/node";

export async function action({ request }) {
  try {
    const payload = await request.json();

    const response = await fetch(
      "https://api.deposco.com/integration/RLL/orders/updates",
      {
        method: "POST",
        headers: {
          Authorization: "Basic cmNhbWJpYXM6RmVxZDIwMjUh",
          "X-Tenant-Code": "RLL",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    return json({ success: true, data });
  } catch (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}
