import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const { items, orderId } = await req.json();

    const line_items = items.map((item: any) => {
      // Ha az ár pl. 110.00, akkor meg kell szoroznunk 100-zal, hogy 11000 legyen.
      // A Math.round biztosítja, hogy ne maradjon tizedesjegy.
      const correctedPrice = Math.round(Number(item.price) * 100);
      
      console.log(`Eredeti ár: ${item.price} -> Stripe-nak küldött ár: ${correctedPrice} HUF`);

      return {
        price_data: {
          currency: "huf",
          product_data: {
            name: item.name,
          },
          unit_amount: correctedPrice, 
        },
        quantity: item.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/penztar/siker`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/kosar`,
      metadata: { orderId: orderId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe hiba:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}