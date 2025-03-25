import { useCallback, useEffect, useState } from "react";
import ProductItem from "../ProductItem/ProductItem";
import "./ProductList.css";
import { useTelegram } from "../../hooks/useTelegram";

const products = [
  {
    id: "1",
    title: "Джинсы",
    price: 5000,
    desctiption: "Синего цвета, прямые",
  },
  {
    id: "2",
    title: "Куртка",
    price: 15000,
    desctiption: "Зеленого цвета, теплая",
  },
  {
    id: "3",
    title: "Джинсы 2",
    price: 5000,
    desctiption: "Синего цвета, прямые",
  },
  {
    id: "4",
    title: "Куртка 8",
    price: 2310,
    desctiption: "Синего цвета, теплая",
  },
  {
    id: "5",
    title: "Джинсы 3",
    price: 600,
    desctiption: "Синего цвета, прямые",
  },
  {
    id: "6",
    title: "Куртка 7",
    price: 5200,
    desctiption: "Желтого цвета, теплая",
  },
  {
    id: "7",
    title: "Джинсы 4",
    price: 5500,
    desctiption: "Красного цвета, прямые",
  },
  {
    id: "8",
    title: "Куртка 5",
    price: 12000,
    desctiption: "Черного цвета, теплая",
  },
];

const getTotalPrice = (items) => {
  return items.reduce((acc, item) => {
    return (acc += item.price);
  }, 0);
};

function ProductList() {
  const [addItems, setAddItems] = useState([]);
  const { tg, queryId } = useTelegram();

  console.log("Telegram объект:", tg);
  console.log("Query ID:", queryId);

  const onSendData = useCallback(async () => {
    const data = {
      products: addItems,
      totalPrice: getTotalPrice(addItems),
      queryId,
    };
    try {
      await fetch("https://telergambot-production.up.railway.app/web-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      tg.showAlert("Заказ успешно отправлен!", queryId);
    } catch (error) {
      tg.showAlert("Ошибка при отправке заказа!");
      console.error("Ошибка запроса:", error, queryId, tg);
    }
  }, [addItems, queryId]);

  useEffect(() => {
    tg.onEvent("mainButtonClicked", onSendData);
    return () => {
      tg.offEvent("mainButtonClicked", onSendData);
    };
  }, [onSendData]);

  const onAdd = (product) => {
    const alreadyAdded = addItems.find((item) => item.id === product.id);
    let newItems = [];

    if (alreadyAdded) {
      newItems = addItems.filter((item) => item.id !== product.id);
    } else {
      newItems = [...addItems, product];
    }
    setAddItems(newItems);

    if (newItems.length === 0) {
      tg.MainButton.hide();
    } else {
      tg.MainButton.show();
      tg.MainButton.setParams({ text: `Купить за ${getTotalPrice(newItems)}` });
    }
  };
  return (
    <div className="list">
      {products.map((item, i) => (
        <ProductItem product={item} onAdd={onAdd} className={"item"} key={i} />
      ))}
    </div>
  );
}

export default ProductList;
