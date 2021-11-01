import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from 'next/router';

const OrderShow = ({ order, currentUser, STRIPE_PUBLIC }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  })

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    const pointer = setInterval(findTimeLeft, 1000);
    findTimeLeft();

    return () => {
      clearInterval(pointer);
    }
  }, []);

  if (timeLeft < 0) {
    return <div>Order Expired, you can go back and try again</div>
  }
  console.log(process.env)
  return (
    <div>
      <div>Time left to pay: {timeLeft} seconds</div>
      <StripeCheckout 
        amount={order.ticket.price * 100}
        token={({ id }) => { doRequest({ token: id }) }} 
        stripeKey={STRIPE_PUBLIC}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data, STRIPE_PUBLIC: process.env.STRIPE_PUBLIC };
}

export default OrderShow;