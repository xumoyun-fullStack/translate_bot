const { TOKEN } = require("./config");
const mongoose = require("./mongoose");
const users = require("./users");
const TelegramBot = require("node-telegram-bot-api");
const translate = require("@vitalets/google-translate-api");

const bot = new TelegramBot('https://simplesampleapp.herokuapp.com/'+TOKEN);

let languages = [
    [
        {
            text: "🇺🇿 O'zbekiston" ,
            callback_data: "uz"
        }
    ]
    ,
    [
        {
            text: "🇷🇺 Русский" ,
            callback_data: "ru"
        }
    ]
    ,
    [
        {
            text: "🇬🇧 English" ,
            callback_data: "en"
        }
    ]
    ,
    [
        {
            text: "🇦🇷 عربي" ,
            callback_data: "ar"
        }
    ]
    ,
];

let langs = {
    "uz": "O'zbekcha",
    "ru": "Русский",
    "en": "English",
    "ar": "عربي"
}



bot.on("message", async(message)=>{
    const userId = message.from.id;
    const messageId = message.message_id;
    const text = message.text;


    const admin = "739752858";

    if(userId == admin){
        if(message.reply_to_message){
            if(text == "/post"){
                let interval = 15/1000;
                let usersList = await users.find();
                let count = 0;
                for( let u of usersList){
                    try{
                        setTimeout(async function(){
                        
                            await bot.copyMessage(u.id, userId, message.reply_to_message.message_id, {
                                reply_markup: message.reply_to_message.reply_markup,
                            })

                    },interval)
                    count++;
                    }catch(e){

                    }
                }

                await bot.sendMessage(admin, `${count} ta userga yuborildi`)
            }
        }
            return;
    }
    
    let user = await users.findOne({
        id: `${userId}`,
    })
    
    if(!user){
        user =  await users.create({
            id: `${userId}`
        })
    }

    if(user.step == 0){
        let keyboard = {
            inline_keyboard: [...languages],
        }

        await bot.sendMessage(userId, "Assalomu aleykum, qaysi tilga tarjima qilmoqchisiz", {
            reply_markup: keyboard,
        })
    }

    if(text == "⬅"){
        await users.findOneAndUpdate({
            id: `${userId}`
        },{
            step: 0,
        })

        let keyboard = {
            inline_keyboard: [...languages],
        }

        await bot.sendMessage(userId, "Assalomu aleykum, qaysi tilga tarjima qilmoqchisiz", {
            reply_markup: keyboard,
        })

    }
    
    if(user.step == 2){
        let res = await translate(text, {from: user.form, to: user.to});
 
        res = res.text;

        await bot.sendMessage(userId, res)
    }
    
})

bot.on("callback_query", async message => {
    const userId = message.from.id;
    const data = message.data;
    

    let user = await users.findOne({
        id: `${userId}`,
    });
   
    if(user.step == 0){
         await users.findOneAndUpdate({
            id: `${userId}`
        },{
            step: 1,
            from: data
        })

        let keyboard = {
            inline_keyboard: [...languages],
        }
        await bot.deleteMessage(userId, message.message.message_id)
        await bot.sendMessage(userId, 'Qaysi tilga tarjima qilinsin', {
            reply_markup: keyboard,
        })
    } else if(user.step == 1){
       await users.findOneAndUpdate({
            id: `${userId}`
        },{
            step: 2,
            to: data
        })
        user = await users.findOne({
            id: `${userId}`,
        })

        
        await bot.sendMessage(userId, `Matn yuboring , men uni <b>${langs[user.from]}</b> dan <b>${langs[user.to]}</b> ga tarjima qilib beraman `, {
            parse_mode: "HTML",
            reply_markup: {
                resize_keyboard: true,
                keyboard:[
                    [
                        {
                            text: "⬅"
                        }
                    ]
                ]
            }
        })
    }
})

mongoose()