export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { product } = req.body || {};

    const PRODUCTS = {
      self_reflection: {
        name: "Personalized Self-Reflection Report",
        amount: 19900
      },

      overthinking_reset: {
        name: "7-Day Overthinking Reset",
        amount: 14900
      },

      relationship_report: {
        name: "Relationship Pattern Report",
        amount: 29900
      }
    };

    if (!product || !PRODUCTS[product]) {
      return res.status(400).json({
        success: false,
        message: "Invalid product"
      });
    }

    const selectedProduct = PRODUCTS[product];

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured"
      });
    }

    const auth = Buffer.from(
      `${keyId}:${keySecret}`
    ).toString("base64");

    const response = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",

        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          amount: selectedProduct.amount,
          currency: "INR",
          receipt: `innerly_${Date.now()}`,

          notes: {
            product: product,
            product_name: selectedProduct.name
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message:
          data.error?.description ||
          "Unable to create Razorpay order"
      });
    }

    return res.status(200).json({
      success: true,
      order: data,
      product: selectedProduct
    });

  } catch (error) {
    console.error(
      "Razorpay order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating payment order"
    });
  }
}
