import TelegramBot from "node-telegram-bot-api";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// replace the value below with the Telegram token you receive from @BotFather
dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;

const app = express();

app.use(express.json());
app.use(cors());

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(chatId, "Ниже появится кнопка, заполни форму", {
      reply_markup: {
        keyboard: [
          [{ text: "Заполни форму", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    });

    await bot.sendMessage(chatId, "Заходи в интернет магазин", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Сделать заказ", web_app: { url: webAppUrl } }],
        ],
      },
    });
  }

  if (msg.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);

      await bot.sendMessage(chatId, "Спасибо за обратную связь!");
      await bot.sendMessage(chatId, "Ваша страна: " + data?.country);
      await bot.sendMessage(chatId, "Ваша улица: " + data?.street);
    } catch (e) {
      console.log(e);
    }
  }
});

app.use((req, res, next) => {
  console.log(`🔥 Получен запрос: ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Бое работает!");
});

app.post("/web-data", async (req, res) => {
  const { queryId, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Успешная покупка",
      input_message_content: {
        message_text:
          `Поздравляю с покупкой, вы приобрели товар на сумму ` + totalPrice,
      },
    });
    return res.status(200).json({ success: true });
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Не удалось приобрести товар",
      input_message_content: {
        message_text: `Не удалось приобрести товар`,
      },
    });
  }
  return res.status(500).json({ success: false });
});

const PORT = process.env.PORT || 8080;
app.use(cors({ origin: "*" }));
app.listen(PORT, () => console.log(`server start port ${PORT}`));
