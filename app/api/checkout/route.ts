import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    // Kinyerjük a shippingFee-t is a kérésből
    const { items, orderId, shippingFee } = await req.json();

    // 1. Termékek átalakítása Stripe formátumra
    const line_items = items.map((item: any) => {
      const correctedPrice = Math.round(Number(item.price) * 100);
      
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

    // 2. Szállítási díj hozzáadása külön tételként, ha van
    if (shippingFee && shippingFee > 0) {
      line_items.push({
        price_data: {
          currency: "huf",
          product_data: {
            name: "Szállítási díj",
          },
          unit_amount: Math.round(shippingFee * 100), // Itt is váltunk fillérre (százas szorzó)
        },
        quantity: 1,
      });
    }

    // 3. Stripe Checkout session létrehozása
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