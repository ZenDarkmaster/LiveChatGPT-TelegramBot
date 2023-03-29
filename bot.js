// Copyright (c) 2023 ZenDarkMaster.
// Licensed under the MIT license.
// See the LICENSE file in the project root for more information.
// Visit my GitHub profile at https://github.com/ZenDarkmaster

import { ChatGPTAPI } from "chatgpt";
import dotenv from "dotenv";
import { marked } from "marked";
import { Telegraf } from "telegraf";

dotenv.config();

const chat_log = new Map();

let start = Date.now();

console.log("starting:", start);

const openai = new ChatGPTAPI({
  apiKey: process.env.APIKEY,
});

const bot = new Telegraf(process.env.TOKEN);
const ownerId = process.env.OWNER_ID; // Owner identifier for future functionality.
const allowedIds = process.env.ALLOWED_IDS.split(',').map(id => Number(id)); // Whitelist of telegram ID addresses.

bot.start((ctx) => {
  const chatId = ctx.chat.id;
  if (allowedIds.includes(chatId)) {
    ctx.reply(`Привет, ${ctx.from.first_name}! Доступ открыт.`);
  } else {
    ctx.reply(`К сожалению, у Вас нет доступа, ${ctx.from.first_name}. Обратитесь к владельцу бота для получения доступа.`);
  }
});

function clearMap() {
  const millis = Date.now() - start;
  if (Math.floor(millis / 1000) > 60 * 5) {
    chat_log.clear();

    start = Date.now();

    console.log("chat log reloaded!");
  }
}

bot.command("ask", async (ctx) => {
  const chatId = ctx.chat.id;
  if (allowedIds.includes(chatId)) {
  const userId = ctx.update.message.from.id;

  if (ctx.update.message.from.is_bot) {
    return false;
  }

  const args = ctx.update.message.text.split(" ");
  args.shift();
  let question = args.join(" ");

  if (question.length == 0) {
    return ctx.reply("Напишите что-то после /ask, чтобы задавать мне вопросы.", {
      reply_to_message_id: ctx.message.message_id,
    });
  }

  ctx.sendChatAction("typing");

  try {
    const initReply = await ctx.reply(marked.parseInline(`печатаю... \n`), {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "HTML",
    });

    let currentMessage = "";
    let replyedMessage = "";

    const updateInterval = setInterval(async () => {
      if (currentMessage !== replyedMessage) {
        try {
          const editMessage = await ctx.telegram.editMessageText(
            ctx.chat.id,
            initReply.message_id,
            0,
            currentMessage
          );
          if (editMessage.message_id) {
            replyedMessage = currentMessage;
          }
        } catch (error) {
          console.log(error);
        }
      }
    }, 1000);

    openai
      .sendMessage(question, {
        parentMessageId: chat_log.get(userId)
          ? chat_log.get(userId)
          : undefined,
        onProgress: (partialResponse) => {
          if (partialResponse.text.length > currentMessage.length) {
            currentMessage = partialResponse.text;
          }
        },
      })
      .then((res) => {
        if (res.text) {
          clearInterval(updateInterval);
          setTimeout(() => {
            try {
              ctx.telegram.editMessageText(
                ctx.chat.id,
                initReply.message_id,
                0,
                res.text
              );
            } catch (error) {
              console.log(error);
            }
          }, 1000);
          clearMap();
          chat_log.set(userId, res.id);
        }
      });
  } catch (error) {
    console.log(error);
  }
  } else {
    ctx.reply(`К сожалению, у Вас не доступа, ${ctx.from.first_name}. Обратитесь к владельцу бота для получения доступа.`);
  }
});

bot.command("reload", async (ctx) => {
  const chatId = ctx.chat.id;
  if (allowedIds.includes(chatId)) {
  chat_log.clear();
  ctx.sendChatAction("typing");
  if (chat_log.size === 0) {
    return ctx.reply("История разговора в памяти ИИ очищена!", {
      reply_to_message_id: ctx.message.message_id,
    });
  }
  } else {
    ctx.reply(`К сожалению, у Вас нет доступа, ${ctx.from.first_name}. Обратитесь к владельцу бота для получения доступа.`);
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));