// ==== DỮ LIỆU TỪ EXCEL "thông tin nông trại.xlsx" (tạo tự động; pinyin hội thoại NPC sinh bằng pinyin-pro) ====
const XLS_VEG = [["VEG01","空心菜","kōngxīncài","Rau muống",1,1,1,1,1],["VEG02","西红柿","xīhóngshì","Cà chua",3,1,1,3,2],["VEG03","胡萝卜","húluóbo","Cà rốt",7,1,1,0,0],["VEG04","白菜","báicài","Cải thảo",10,3,2,2,0],["VEG05","黄瓜","huángguā","Dưa leo",13,4,3,3,2],["VEG06","土豆","tǔdòu","Khoai tây",16,5,1,0,0],["VEG07","卷心菜","juǎnxīncài","Bắp cải",19,4,2,2,0],["VEG08","南瓜","nánguā","Bí đỏ",22,5,2,3,0],["VEG09","落葵","luòkuí","Rau mồng tơi",25,2,3,1,1],["VEG10","芥菜","jiècài","Cải xanh",28,3,2,2,0],["VEG11","茄子","qiézi","Cà tím",31,5,3,3,2],["VEG12","辣椒","làjiāo","Ớt",34,4,3,3,2],["VEG13","洋葱","yángcōng","Hành tây",37,4,1,0,0],["VEG14","大蒜","dàsuàn","Tỏi",40,5,1,0,0],["VEG15","生菜","shēngcài","Xà lách",42,2,3,1,1],["VEG16","菠菜","bōcài","Rau chân vịt",44,3,2,2,0],["VEG17","玉米","yùmǐ","Ngô",46,5,1,0,0],["VEG18","白萝卜","báiluóbo","Củ cải trắng",47,4,1,0,0],["VEG19","西兰花","xīlánhuā","Bông cải xanh",49,4,2,2,0],["VEG20","豆角","dòujiǎo","Đậu que",50,4,3,3,2]];
const XLS_ANI = [["ANI01","鸡","jī","Gà","Đẻ trứng; người chơi cho ăn, lấy trứng và dọn chuồng","鸡舍 - Chuồng gà",1],["ANI02","猪","zhū","Heo","Chăm sóc theo ngày; có thể bán vật nuôi/sản phẩm theo cơ chế game","猪舍 - Chuồng heo",20],["ANI03","羊","yáng","Cừu","Cho ăn, chăm sóc và thu hoạch lông cừu","羊舍 - Chuồng cừu",30],["ANI04","牛","niú","Bò","Cho ăn, chăm sóc và thu hoạch sữa","牛舍 - Chuồng bò",40],["ANI05","狗","gǒu","Chó","Thú cưng trong nhà; chạy quanh nhà, có thể đi theo nhân vật","家里 - Trong nhà",12],["ANI06","猫","māo","Mèo","Thú cưng trong nhà; chạy quanh nhà và có hoạt ảnh đuổi/bắt chuột","家里 - Trong nhà",16]];
const XLS_FRUIT = [["FR01","苹果","píngguǒ","Táo",20],["FR02","橘子","júzi","Quýt",22],["FR03","桃子","táozi","Đào",25],["FR04","梨","lí","Lê",27],["FR05","葡萄","pútao","Nho",30],["FR06","草莓","cǎoméi","Dâu tây",21],["FR07","香蕉","xiāngjiāo","Chuối",33],["FR08","西瓜","xīguā","Dưa hấu",36],["FR09","芒果","mángguǒ","Xoài",39],["FR10","菠萝","bōluó","Dứa",42],["FR11","火龙果","huǒlóngguǒ","Thanh long",46],["FR12","荔枝","lìzhī","Vải",50]];
const XLS_FISH = [["F01","鲤鱼","lǐyú","Cá chép",20],["F04","鲶鱼","niányú","Cá trê",30],["F05","罗非鱼","luófēiyú","Cá rô phi",34],["F06","金鱼","jīnyú","Cá vàng",38],["F09","虾","xiā","Tôm",48],["F10","螃蟹","pángxiè","Cua",50]];
const XLS_TOOL = [["T01","锄头","chútou","Cuốc","Làm đất",1],["T03","水壶","shuǐhú","Bình tưới","Tưới cây",1],["T04","种子","zhǒngzi","Hạt giống","Trồng trọt",1],["T05","肥料","féiliào","Phân bón","Trồng trọt",10],["T06","篮子","lánzi","Giỏ","Thu hoạch",5],["T07","鱼竿","yúgān","Cần câu","Câu cá",15],["T08","鱼饵","yú'ěr","Mồi câu","Câu cá",16],["T10","手套","shǒutào","Găng tay","vặt sác cây sau khi thu hoạch",12],["H01","床","chuáng","Giường","Trong nhà",1],["H02","厨房","chúfáng","Nhà bếp","Trong nhà",1],["H03","冰箱","bīngxiāng","Tủ lạnh","Trong nhà",1],["H04","锅","guō","Nồi","Trong nhà",1],["H05","碗","wǎn","Bát","Trong nhà",1],["H06","筷子","kuàizi","Đũa","Trong nhà",1],["S04","饲料","sìliào","Thức ăn chăn nuôi","Mua bán",1],["S05","水井","shuǐjǐng","Giếng nước","Nông trại",1]];
const XLS_DECOR = [["DEC01","Nội thất","沙发","shāfā","Sofa",300,4,"Phòng khách"],["DEC02","Nội thất","茶几","chájī","Bàn trà",120,9,"Phòng khách"],["DEC03","Nội thất","地毯","dìtǎn","Thảm trải sàn",100,14,"Phòng khách"],["DEC04","Đồ lưu trữ","书架","shūjià","Kệ sách",180,19,"Phòng khách"],["DEC05","Trang trí","挂画","guàhuà","Tranh treo tường",80,24,"Phòng khách / phòng ngủ"],["DEC06","Trang trí","时钟","shízhōng","Đồng hồ treo tường",70,29,"Phòng khách / nhà bếp"],["DEC07","Trang trí","窗帘","chuānglián","Rèm cửa",110,34,"Phòng ngủ"],["DEC08","Trang trí","台灯","táidēng","Đèn bàn",90,39,"Phòng ngủ"],["DEC09","Trang trí","盆栽","pénzāi","Chậu cây cảnh",60,44,"Phòng khách / phòng ngủ"],["DEC10","Đồ sinh hoạt","鞋架","xiéjià","Kệ để giày",130,49,"Gần cửa ra vào"]];
const XLS_SENT = [["Chăm gà","鸡饿了。","Jī è le.","Gà đói rồi.","Ngắn"],["Chăm gà","我去给鸡喂食。","Wǒ qù gěi jī wèishí.","Tôi đi cho gà ăn.","Ngắn"],["Chăm gà","鸡正在吃饲料。","Jī zhèngzài chī sìliào.","Gà đang ăn thức ăn.","Ngắn"],["Chăm gà","今天的鸡蛋还没有收。","Jīntiān de jīdàn hái méiyǒu shōu.","Trứng hôm nay vẫn chưa được thu hoạch.","Vừa"],["Chăm gà","这只母鸡下了一个蛋。","Zhè zhī mǔjī xià le yí ge dàn.","Con gà mái này vừa đẻ một quả trứng.","Vừa"],["Chăm gà","鸡舍里有六只鸡。","Jīshè lǐ yǒu liù zhī jī.","Trong chuồng có sáu con gà.","Ngắn"],["Chăm gà","鸡舍里太脏了，我得打扫一下。","Jīshè lǐ tài zāng le, wǒ děi dǎsǎo yíxià.","Chuồng gà bẩn quá, tôi phải dọn dẹp một chút.","Vừa"],["Chăm gà","鸡拉了很多粪，得赶快清理干净。","Jī lā le hěn duō fèn, děi gǎnkuài qīnglǐ gānjìng.","Gà thải phân nhiều quá, phải mau dọn cho sạch thôi.","Dài"],["Chăm gà","我已经把六个食槽都加满了。","Wǒ yǐjīng bǎ liù ge shícáo dōu jiā mǎn le.","Tôi đã đổ đầy thức ăn vào cả sáu máng rồi.","Dài"],["Chăm gà","水槽里的水不够了，我要去井边打水。","Shuǐcáo lǐ de shuǐ bú gòu le, wǒ yào qù jǐngbiān dǎ shuǐ.","Nước trong máng không đủ nữa, tôi phải ra giếng lấy nước.","Dài"],["Chăm heo, cừu, bò","小猪在睡觉。","Xiǎo zhū zài shuìjiào.","Heo con đang ngủ.","Ngắn"],["Chăm heo, cừu, bò","我正在给猪喂食。","Wǒ zhèngzài gěi zhū wèishí.","Tôi đang cho heo ăn.","Ngắn"],["Chăm heo, cừu, bò","猪吃饱了。","Zhū chī bǎo le.","Heo ăn no rồi.","Ngắn"],["Chăm heo, cừu, bò","这只羊需要剪毛了。","Zhè zhī yáng xūyào jiǎn máo le.","Con cừu này cần được xén lông rồi.","Vừa"],["Chăm heo, cừu, bò","牛正在吃草。","Niú zhèngzài chī cǎo.","Bò đang ăn cỏ.","Ngắn"],["Chăm heo, cừu, bò","今天可以收牛奶了。","Jīntiān kěyǐ shōu niúnǎi le.","Hôm nay có thể thu sữa bò rồi.","Vừa"],["Chăm heo, cừu, bò","这些动物都需要新鲜的水。","Zhèxiē dòngwù dōu xūyào xīnxiān de shuǐ.","Những con vật này đều cần nước sạch.","Vừa"],["Chăm heo, cừu, bò","喂完动物以后，别忘了检查食槽。","Wèi wán dòngwù yǐhòu, bié wàng le jiǎnchá shícáo.","Sau khi cho động vật ăn, đừng quên kiểm tra máng thức ăn.","Dài"],["Chăm heo, cừu, bò","每个围栏最多只能养六只动物。","Měi ge wéilán zuìduō zhǐ néng yǎng liù zhī dòngwù.","Mỗi chuồng chỉ có thể nuôi tối đa sáu con vật.","Dài"],["Chăm heo, cừu, bò","这头牛今天还没有吃东西。","Zhè tóu niú jīntiān hái méiyǒu chī dōngxi.","Con bò này hôm nay vẫn chưa ăn gì.","Vừa"],["Trồng rau","我在种菜。","Wǒ zài zhòng cài.","Tôi đang trồng rau.","Ngắn"],["Trồng rau","种子发芽了。","Zhǒngzi fāyá le.","Hạt giống nảy mầm rồi.","Ngắn"],["Trồng rau","这块地还没有种东西。","Zhè kuài dì hái méiyǒu zhòng dōngxi.","Mảnh đất này vẫn chưa trồng gì.","Vừa"],["Trồng rau","我先把土翻松，再撒种子。","Wǒ xiān bǎ tǔ fān sōng, zài sǎ zhǒngzi.","Tôi xới đất cho tơi trước, sau đó mới gieo hạt.","Dài"],["Trồng rau","这些菜长得真快。","Zhèxiē cài zhǎng de zhēn kuài.","Những cây rau này lớn nhanh thật.","Ngắn"],["Trồng rau","菜还没成熟，不能收。","Cài hái méi chéngshú, bù néng shōu.","Rau vẫn chưa chín, chưa thể thu hoạch.","Vừa"],["Trồng rau","这几棵菜已经可以收割了。","Zhè jǐ kē cài yǐjīng kěyǐ shōugē le.","Mấy cây rau này đã có thể thu hoạch rồi.","Vừa"],["Trồng rau","成熟的蔬菜上面有闪闪发亮的小星星。","Chéngshú de shūcài shàngmiàn yǒu shǎnshǎn fāliàng de xiǎo xīngxing.","Trên những cây rau đã chín có những ngôi sao nhỏ lấp lánh.","Dài"],["Trồng rau","我今天种了两排胡萝卜和一排白菜。","Wǒ jīntiān zhòng le liǎng pái húluóbo hé yì pái báicài.","Hôm nay tôi trồng hai luống cà rốt và một luống cải thảo.","Dài"],["Trồng rau","收菜的时候，记得把成熟的和没成熟的分开。","Shōu cài de shíhou, jìde bǎ chéngshú de hé méi chéngshú de fēnkāi.","Khi thu hoạch rau, nhớ tách rau đã chín và rau chưa chín ra.","Dài"],["Tưới nước","我去打水。","Wǒ qù dǎ shuǐ.","Tôi đi lấy nước.","Ngắn"],["Tưới nước","我在给菜浇水。","Wǒ zài gěi cài jiāoshuǐ.","Tôi đang tưới rau.","Ngắn"],["Tưới nước","这块地太干了。","Zhè kuài dì tài gān le.","Mảnh đất này khô quá.","Ngắn"],["Tưới nước","水桶里还有五份水。","Shuǐtǒng lǐ hái yǒu wǔ fèn shuǐ.","Trong xô vẫn còn năm phần nước.","Vừa"],["Tưới nước","今天下雨了，不用给菜浇水。","Jīntiān xiàyǔ le, bú yòng gěi cài jiāoshuǐ.","Hôm nay trời mưa rồi, không cần tưới rau.","Vừa"],["Tưới nước","太阳太大了，土很快就会变干。","Tàiyáng tài dà le, tǔ hěn kuài jiù huì biàn gān.","Nắng gắt quá, đất sẽ nhanh chóng bị khô.","Vừa"],["Tưới nước","我得先去井边打水，然后再回来浇菜。","Wǒ děi xiān qù jǐngbiān dǎ shuǐ, ránhòu zài huílái jiāo cài.","Tôi phải ra giếng lấy nước trước, sau đó quay lại tưới rau.","Dài"],["Tưới nước","每一块菜地都要浇到，不能漏掉。","Měi yí kuài càidì dōu yào jiāo dào, bù néng lòudiào.","Mỗi ô đất trồng rau đều phải được tưới, không được bỏ sót.","Dài"],["Tưới nước","今天的水不够了，我还得再去打几桶。","Jīntiān de shuǐ bú gòu le, wǒ hái děi zài qù dǎ jǐ tǒng.","Hôm nay không đủ nước rồi, tôi còn phải đi lấy thêm vài xô.","Dài"],["Thời gian, thời tiết","今天是晴天。","Jīntiān shì qíngtiān.","Hôm nay trời nắng.","Ngắn"],["Thời gian, thời tiết","今天有点儿阴。","Jīntiān yǒudiǎnr yīn.","Hôm nay hơi âm u.","Ngắn"],["Thời gian, thời tiết","外面正在下雨。","Wàimiàn zhèngzài xiàyǔ.","Bên ngoài đang mưa.","Ngắn"],["Thời gian, thời tiết","已经晚上了，该回家了。","Yǐjīng wǎnshang le, gāi huíjiā le.","Trời tối rồi, đến lúc về nhà thôi.","Vừa"],["Thời gian, thời tiết","睡一觉以后，农场就到第二天了。","Shuì yí jiào yǐhòu, nóngchǎng jiù dào dì èr tiān le.","Sau khi ngủ một giấc, nông trại sẽ chuyển sang ngày thứ hai.","Dài"],["Thời gian, thời tiết","有些种子一天就能发芽，有些需要更长时间。","Yǒuxiē zhǒngzi yì tiān jiù néng fāyá, yǒuxiē xūyào gèng cháng shíjiān.","Có hạt giống chỉ cần một ngày là nảy mầm, có loại cần thời gian lâu hơn.","Dài"],["Thời gian, thời tiết","下雨的时候，农民可以先做别的事情。","Xiàyǔ de shíhou, nóngmín kěyǐ xiān zuò bié de shìqing.","Khi trời mưa, người nông dân có thể làm việc khác trước.","Dài"],["Thời gian, thời tiết","新的一天开始了，我们去看看农场吧。","Xīn de yì tiān kāishǐ le, wǒmen qù kànkan nóngchǎng ba.","Một ngày mới bắt đầu rồi, chúng ta đi xem nông trại nhé.","Dài"],["Vườn cây ăn quả","苹果树开花了。","Píngguǒshù kāihuā le.","Cây táo ra hoa rồi.","Ngắn"],["Vườn cây ăn quả","树上结了很多果子。","Shù shàng jié le hěn duō guǒzi.","Trên cây kết rất nhiều quả.","Vừa"],["Vườn cây ăn quả","这些草莓已经红了。","Zhèxiē cǎoméi yǐjīng hóng le.","Những quả dâu tây này đã đỏ rồi.","Vừa"],["Vườn cây ăn quả","我想摘几个橘子带回家。","Wǒ xiǎng zhāi jǐ ge júzi dài huíjiā.","Tôi muốn hái vài quả quýt mang về nhà.","Vừa"],["Vườn cây ăn quả","果子还很小，再等两天吧。","Guǒzi hái hěn xiǎo, zài děng liǎng tiān ba.","Quả vẫn còn nhỏ, đợi thêm hai ngày nữa nhé.","Vừa"],["Vườn cây ăn quả","这棵树结了很多苹果，看来今年收成不错。","Zhè kē shù jié le hěn duō píngguǒ, kànlái jīnnián shōuchéng búcuò.","Cây này kết rất nhiều táo, xem ra năm nay được mùa khá tốt.","Dài"],["Vườn cây ăn quả","摘水果的时候要小心，不要把树枝弄断了。","Zhāi shuǐguǒ de shíhou yào xiǎoxīn, bú yào bǎ shùzhī nòng duàn le.","Khi hái trái cây phải cẩn thận, đừng làm gãy cành cây.","Dài"],["Ao cá, câu cá","我去钓鱼。","Wǒ qù diàoyú.","Tôi đi câu cá.","Ngắn"],["Ao cá, câu cá","鱼在水里游。","Yú zài shuǐ lǐ yóu.","Cá đang bơi trong nước.","Ngắn"],["Ao cá, câu cá","我钓到了一条鱼。","Wǒ diào dào le yì tiáo yú.","Tôi câu được một con cá.","Vừa"],["Ao cá, câu cá","鱼塘里的水很清。","Yútáng lǐ de shuǐ hěn qīng.","Nước trong ao cá rất trong.","Vừa"],["Ao cá, câu cá","今天鱼儿不太爱吃鱼饵。","Jīntiān yú'ér bú tài ài chī yú'ěr.","Hôm nay cá không thích ăn mồi lắm.","Vừa"],["Ao cá, câu cá","我先准备鱼竿和鱼饵，再去池塘边。","Wǒ xiān zhǔnbèi yúgān hé yú'ěr, zài qù chítáng biān.","Tôi chuẩn bị cần câu và mồi trước, rồi mới ra bờ ao.","Dài"],["Ao cá, câu cá","鱼塘里的鱼需要定期喂食，也要保持水干净。","Yútáng lǐ de yú xūyào dìngqī wèishí, yě yào bǎochí shuǐ gānjìng.","Cá trong ao cần được cho ăn định kỳ, đồng thời phải giữ nước sạch.","Dài"],["Nấu ăn, năng lượng","我饿了。","Wǒ è le.","Tôi đói rồi.","Ngắn"],["Nấu ăn, năng lượng","我想做饭。","Wǒ xiǎng zuòfàn.","Tôi muốn nấu ăn.","Ngắn"],["Nấu ăn, năng lượng","锅里煮着汤。","Guō lǐ zhǔzhe tāng.","Trong nồi đang nấu canh.","Ngắn"],["Nấu ăn, năng lượng","吃点儿东西可以恢复体力。","Chī diǎnr dōngxi kěyǐ huīfù tǐlì.","Ăn một chút có thể hồi phục thể lực.","Vừa"],["Nấu ăn, năng lượng","我用今天收获的蔬菜做了一碗汤。","Wǒ yòng jīntiān shōuhuò de shūcài zuò le yì wǎn tāng.","Tôi dùng rau thu hoạch hôm nay để nấu một bát canh.","Dài"],["Nấu ăn, năng lượng","体力不够了，我得先回家吃点儿东西。","Tǐlì bú gòu le, wǒ děi xiān huíjiā chī diǎnr dōngxi.","Thể lực không đủ nữa, tôi phải về nhà ăn chút gì trước.","Dài"],["Nấu ăn, năng lượng","冰箱里还有鸡蛋、蔬菜和牛奶。","Bīngxiāng lǐ hái yǒu jīdàn, shūcài hé niúnǎi.","Trong tủ lạnh vẫn còn trứng, rau và sữa.","Vừa"],["Nấu ăn, năng lượng","饭做好了，吃完我们再去照顾动物。","Fàn zuò hǎo le, chī wán wǒmen zài qù zhàogù dòngwù.","Cơm nấu xong rồi, ăn xong chúng ta lại đi chăm sóc động vật.","Dài"],["Mua bán","这个多少钱？","Zhège duōshao qián?","Cái này bao nhiêu tiền?","Ngắn"],["Mua bán","我想买一些种子。","Wǒ xiǎng mǎi yìxiē zhǒngzi.","Tôi muốn mua một ít hạt giống.","Ngắn"],["Mua bán","今天的鸡蛋可以卖钱了。","Jīntiān de jīdàn kěyǐ mài qián le.","Trứng hôm nay có thể đem bán lấy tiền rồi.","Vừa"],["Mua bán","我想买两只小鸡，请问还有吗？","Wǒ xiǎng mǎi liǎng zhī xiǎojī, qǐngwèn hái yǒu ma?","Tôi muốn mua hai con gà con, xin hỏi còn không?","Dài"],["Mua bán","这些蔬菜很新鲜，我全都买了。","Zhèxiē shūcài hěn xīnxiān, wǒ quándōu mǎi le.","Những loại rau này rất tươi, tôi mua hết.","Vừa"],["Mua bán","今天我带了六个鸡蛋来卖，一共多少钱？","Jīntiān wǒ dài le liù ge jīdàn lái mài, yígòng duōshao qián?","Hôm nay tôi mang sáu quả trứng đến bán, tổng cộng bao nhiêu tiền?","Dài"],["Mua bán","如果我买得多一点儿，可以便宜一些吗？","Rúguǒ wǒ mǎi de duō yìdiǎnr, kěyǐ piányi yìxiē ma?","Nếu tôi mua nhiều hơn một chút thì có thể giảm giá không?","Dài"],["Mua bán","今天的鱼和水果都卖完了。","Jīntiān de yú hé shuǐguǒ dōu mài wán le.","Hôm nay cá và trái cây đều bán hết rồi.","Vừa"],["Mua bán","我先看看价格，再决定要买多少。","Wǒ xiān kànkan jiàgé, zài juédìng yào mǎi duōshao.","Tôi xem giá trước rồi mới quyết định mua bao nhiêu.","Dài"],["Sinh hoạt nông trại","早上好！我们开始工作吧。","Zǎoshang hǎo! Wǒmen kāishǐ gōngzuò ba.","Chào buổi sáng! Chúng ta bắt đầu làm việc thôi.","Vừa"],["Sinh hoạt nông trại","我先去看看菜地。","Wǒ xiān qù kànkan càidì.","Tôi đi xem vườn rau trước.","Ngắn"],["Sinh hoạt nông trại","今天还有很多事情要做。","Jīntiān hái yǒu hěn duō shìqing yào zuò.","Hôm nay vẫn còn rất nhiều việc phải làm.","Vừa"],["Sinh hoạt nông trại","做完农活以后，我要回家休息。","Zuò wán nónghuó yǐhòu, wǒ yào huíjiā xiūxi.","Làm xong việc đồng áng, tôi sẽ về nhà nghỉ ngơi.","Vừa"],["Sinh hoạt nông trại","我的背包快满了，得先把东西放回仓库。","Wǒ de bèibāo kuài mǎn le, děi xiān bǎ dōngxi fàng huí cāngkù.","Ba lô của tôi sắp đầy rồi, phải cất đồ vào kho trước.","Dài"],["Sinh hoạt nông trại","今天的工作做完了，可以回房间睡觉了。","Jīntiān de gōngzuò zuò wán le, kěyǐ huí fángjiān shuìjiào le.","Công việc hôm nay xong rồi, có thể về phòng ngủ thôi.","Dài"],["Sinh hoạt nông trại","我每天都要照顾蔬菜和动物，农场生活真忙啊！","Wǒ měitiān dōu yào zhàogù shūcài hé dòngwù, nóngchǎng shēnghuó zhēn máng a!","Ngày nào tôi cũng phải chăm rau và động vật, cuộc sống ở nông trại bận rộn thật!","Dài"],["Sinh hoạt nông trại","客人来了，我去门口看看他想买什么。","Kèrén lái le, wǒ qù ménkǒu kànkan tā xiǎng mǎi shénme.","Có khách đến rồi, tôi ra cổng xem khách muốn mua gì.","Dài"],["Sinh hoạt nông trại","欢迎来到我的农场！你想买些什么？","Huānyíng láidào wǒ de nóngchǎng! Nǐ xiǎng mǎi xiē shénme?","Chào mừng đến nông trại của tôi! Bạn muốn mua gì?","Dài"],["Sinh hoạt nông trại","今天的收成不错，仓库里已经放满了蔬菜和水果。","Jīntiān de shōuchéng búcuò, cāngkù lǐ yǐjīng fàng mǎn le shūcài hé shuǐguǒ.","Hôm nay thu hoạch khá tốt, trong kho đã chất đầy rau củ và trái cây.","Dài"],["Chăm gà","鸡舍里有一股味道，我们该打扫了。","Jīshè lǐ yǒu yì gǔ wèidao, wǒmen gāi dǎsǎo le.","Chuồng gà có mùi rồi, chúng ta nên dọn thôi.","Dài"],["Chăm gà","我数了数，六只鸡都在鸡舍里。","Wǒ shǔ le shǔ, liù zhī jī dōu zài jīshè lǐ.","Tôi đếm thử rồi, cả sáu con gà đều ở trong chuồng.","Dài"],["Chăn nuôi","小猪长大了一点儿。","Xiǎo zhū zhǎng dà le yìdiǎnr.","Heo con đã lớn thêm một chút.","Ngắn"],["Chăn nuôi","如果今天忘了喂动物，它们明天就没有东西吃了。","Rúguǒ jīntiān wàng le wèi dòngwù, tāmen míngtiān jiù méiyǒu dōngxi chī le.","Nếu hôm nay quên cho động vật ăn, ngày mai chúng sẽ không có gì để ăn.","Dài"],["Trồng rau","我把种子放进土里，再轻轻盖上一层土。","Wǒ bǎ zhǒngzi fàng jìn tǔ lǐ, zài qīngqīng gài shàng yì céng tǔ.","Tôi đặt hạt giống xuống đất rồi nhẹ nhàng phủ lên một lớp đất.","Dài"],["Trồng rau","这排黄瓜长得比昨天高了。","Zhè pái huángguā zhǎng de bǐ zuótiān gāo le.","Hàng dưa leo này đã cao hơn hôm qua.","Vừa"],["Tưới nước","别忘了给最里面的菜地浇水。","Bié wàng le gěi zuì lǐmiàn de càidì jiāoshuǐ.","Đừng quên tưới nước cho luống rau ở trong cùng.","Vừa"],["Vườn cây ăn quả","我把摘下来的水果放进篮子里。","Wǒ bǎ zhāi xiàlái de shuǐguǒ fàng jìn lánzi lǐ.","Tôi bỏ trái cây vừa hái vào trong giỏ.","Vừa"],["Ao cá, câu cá","这条鱼太小了，我们把它放回水里吧。","Zhè tiáo yú tài xiǎo le, wǒmen bǎ tā fàng huí shuǐ lǐ ba.","Con cá này nhỏ quá, chúng ta thả nó lại xuống nước nhé.","Dài"],["Mua bán","请帮我称一下这些蔬菜。","Qǐng bāng wǒ chēng yíxià zhèxiē shūcài.","Phiền bạn cân giúp tôi số rau này.","Ngắn"],["Mua bán","我卖掉了今天收获的鸡蛋，赚了不少钱。","Wǒ mài diào le jīntiān shōuhuò de jīdàn, zhuàn le bù shǎo qián.","Tôi đã bán số trứng thu hoạch hôm nay và kiếm được kha khá tiền.","Dài"],["Sinh hoạt nông trại","先把今天要做的事情安排好，再开始干活。","Xiān bǎ jīntiān yào zuò de shìqing ānpái hǎo, zài kāishǐ gànhuó.","Hãy sắp xếp những việc cần làm hôm nay trước rồi mới bắt đầu làm.","Dài"]];
const XLS_NPC = [["Chào hỏi, thăm nhà","你好！我是附近的村民。","Nǐ hǎo! wǒ shì fù jìn de cūn mín.","Xin chào! Tôi là dân làng ở gần đây.",["你好！欢迎来我的农场。","很新鲜，今天早上刚摘的。","如果雨水充足，就不用浇了。"],["Nǐ hǎo! huān yíng lái wǒ de nóng chǎng.","Hěn xīn xiān, jīn tiān zǎo shàng gāng zhāi de.","Rú guǒ yǔ shuǐ chōng zú, jiù bú yòng jiāo le."],0],["Chào hỏi, thăm nhà","我可以进来看看吗？","Wǒ kě yǐ jìn lái kàn kàn ma?","Tôi có thể vào tham quan không?",["可以，没问题。","每天要准备足够的草和干净的水。","当然可以，欢迎！"],["Kě yǐ, méi wèn tí.","Měi tiān yào zhǔn bèi zú gòu de cǎo hé gān jìng de shuǐ.","Dāng rán kě yǐ, huān yíng!"],2],["Chào hỏi, thăm nhà","你今天忙不忙？","Nǐ jīn tiān máng bu máng?","Hôm nay bạn có bận không?",["我想种更多水果，也想养更多鱼。","今天不太忙，你呢？","好的，请稍等。"],["Wǒ xiǎng zhǒng gèng duō shuǐ guǒ, yě xiǎng yǎng gèng duō yú.","Jīn tiān bú tài máng, nǐ ne?","Hǎo de, qǐng shāo děng."],1],["Chào hỏi, thăm nhà","你的农场真漂亮！","Nǐ de nóng chǎng zhēn piào liang!","Nông trại của bạn đẹp quá!",["谢谢你！","一共十八元。","你好，请问有什么事？"],["Xiè xiè nǐ!","Yí gòng shí bā yuán.","Nǐ hǎo, qǐng wèn yǒu shén me shì?"],0],["Chào hỏi, thăm nhà","我第一次来这里。","Wǒ dì yī cì lái zhè lǐ.","Đây là lần đầu tiên tôi đến đây.",["可以，我给你打九折。","真的吗？运费怎么算？","欢迎你！我带你参观一下。"],["Kě yǐ, wǒ gěi nǐ dǎ jiǔ zhé.","Zhēn de ma? yùn fèi zěn me suàn?","Huān yíng nǐ! wǒ dài nǐ cān guān yí xià."],2],["Chào hỏi, thăm nhà","你在这里住了多久了？","Nǐ zài zhè lǐ zhù le duō jiǔ le?","Bạn sống ở đây bao lâu rồi?",["可以，请介绍一下。","我在这里住了三年。","可以，请扫这里。"],["Kě yǐ, qǐng jiè shào yí xià.","Wǒ zài zhè lǐ zhù le sān nián.","Kě yǐ, qǐng sǎo zhè lǐ."],1],["Chào hỏi, thăm nhà","今天的天气真舒服！","Jīn tiān de tiān qì zhēn shū fú!","Thời tiết hôm nay dễ chịu thật!",["是啊，很适合在农场散步。","收的，请问有多少个？","听起来不错，我考虑一下。"],["Shì a, hěn shì hé zài nóng chǎng sàn bù.","Shōu de, qǐng wèn yǒu duō shǎo gè?","Tīng qǐ lái bú cuò, wǒ kǎo lǜ yí xià."],0],["Chào hỏi, thăm nhà","打扰一下，你有时间吗？","Dǎ rǎo yí xià, nǐ yǒu shí jiān ma?","Xin làm phiền, bạn có thời gian không?",["卖的，一只十元。","太好了，什么时候可以来？","有，请问有什么事？"],["Mài de, yì zhī shí yuán.","Tài hǎo le, shén me shí hòu kě yǐ lái?","Yǒu, qǐng wèn yǒu shén me shì?"],2],["Chào hỏi, thăm nhà","谢谢你带我参观农场。","Xiè xiè nǐ dài wǒ cān guān nóng chǎng.","Cảm ơn bạn đã dẫn tôi tham quan nông trại.",["暂时不用，谢谢。","不用谢，欢迎下次再来。","好的，你想要多大的？"],["Zàn shí bú yòng, xiè xiè.","Bú yòng xiè, huān yíng xià cì zài lái.","Hǎo de, nǐ xiǎng yào duō dà de?"],1],["Chào hỏi, thăm nhà","你一个人管理这么大的农场吗？","Nǐ yí gè rén guǎn lǐ zhè me dà de nóng chǎng ma?","Bạn quản lý nông trại lớn thế này một mình à?",["是啊，每天都有很多事情要做。","一只三百元。","在哪里举办？"],["Shì a, měi tiān dōu yǒu hěn duō shì qíng yào zuò.","Yì zhī sān bǎi yuán.","Zài nǎ lǐ jǔ bàn?"],0],["Hỏi đường, tìm địa điểm","请问，商店怎么走？","Qǐng wèn, shāng diàn zěn me zǒu?","Xin hỏi, đi đến cửa hàng thế nào?",["好的，我们可以帮你安排。","愿意，请告诉我时间和地点。","商店在房子右边。"],["Hǎo de, wǒ men kě yǐ bāng nǐ ān pái.","Yuàn yì, qǐng gào sù wǒ shí jiān hé dì diǎn.","Shāng diàn zài fáng zi yòu biān."],2],["Hỏi đường, tìm địa điểm","水井在哪里？","Shuǐ jǐng zài nǎ lǐ?","Giếng nước ở đâu?",["好的，谢谢你。","水井在菜园旁边。","春天和天气温暖的时候都可以。"],["Hǎo de, xiè xiè nǐ.","Shuǐ jǐng zài cài yuán páng biān.","Chūn tiān hé tiān qì wēn nuǎn de shí hòu dōu kě yǐ."],1],["Hỏi đường, tìm địa điểm","我想去后院，应该往哪边走？","Wǒ xiǎng qù hòu yuàn, yīng gāi wǎng nǎ biān zǒu?","Tôi muốn ra vườn sau, nên đi hướng nào?",["请从那边的小路走。","有，在左边的架子上。","好的，我有需要再联系你。"],["Qǐng cóng nà biān de xiǎo lù zǒu.","Yǒu, zài zuǒ biān de jià zi shàng.","Hǎo de, wǒ yǒu xū yào zài lián xì nǐ."],0],["Hỏi đường, tìm địa điểm","厕所在哪里？","Cè suǒ zài nǎ lǐ?","Nhà vệ sinh ở đâu?",["好的，你需要几袋？","没关系，旁边有水可以洗鞋。","在房子后面。"],["Hǎo de, nǐ xū yào jǐ dài?","Méi guān xì, páng biān yǒu shuǐ kě yǐ xǐ xié.","Zài fáng zi hòu miàn."],2],["Hỏi đường, tìm địa điểm","去鱼塘远不远？","Qù yú táng yuǎn bu yuǎn?","Đi đến ao cá có xa không?",["别着急，我帮你找找。","不远，沿着这条路走就到了。","要看每袋的重量和喂食量。"],["Bié zháo jí, wǒ bāng nǐ zhǎo zhǎo.","Bù yuǎn, yán zhe zhè tiáo lù zǒu jiù dào le.","Yào kàn měi dài de zhòng liàng hé wèi shí liàng."],1],["Hỏi đường, tìm địa điểm","我迷路了，可以帮帮我吗？","Wǒ mí lù le, kě yǐ bāng bāng wǒ ma?","Tôi bị lạc rồi, bạn giúp tôi được không?",["当然可以，你想去哪里？","每天给它们准备食物和干净的水。","我来把它送回鸡舍。"],["Dāng rán kě yǐ, nǐ xiǎng qù nǎ lǐ?","Měi tiān gěi tā men zhǔn bèi shí wù hé gān jìng de shuǐ.","Wǒ lái bǎ tā sòng huí jī shè."],0],["Hỏi đường, tìm địa điểm","从这里怎么去鸡舍？","Cóng zhè lǐ zěn me qù jī shè?","Từ đây đi đến chuồng gà thế nào?",["有，猫可以在家里活动，也能帮忙抓老鼠。","是啊，它真能干！","鸡舍在房子旁边。"],["Yǒu, māo kě yǐ zài jiā lǐ huó dòng, yě néng bāng máng zhuā lǎo shǔ.","Shì a, tā zhēn néng gàn!","Jī shè zài fáng zi páng biān."],2],["Hỏi đường, tìm địa điểm","请问，出口在哪里？","Qǐng wèn, chū kǒu zài nǎ lǐ?","Xin hỏi, lối ra ở đâu?",["好，我们先在屋里休息。","出口在那条小路的尽头。","有，它常常在屋子周围跑。"],["Hǎo, wǒ men xiān zài wū lǐ xiū xi.","Chū kǒu zài nà tiáo xiǎo lù de jìn tóu.","Yǒu, tā cháng cháng zài wū zi zhōu wéi pǎo."],1],["Hỏi đường, tìm địa điểm","去果园要走多久？","Qù guǒ yuán yào zǒu duō jiǔ?","Đi đến vườn cây ăn quả mất bao lâu?",["大概五分钟。","它叫小白。","我先把东西放回仓库。"],["Dà gài wǔ fēn zhōng.","Tā jiào xiǎo bái.","Wǒ xiān bǎ dōng xī fàng huí cāng kù."],0],["Hỏi đường, tìm địa điểm","这条路可以去村子吗？","Zhè tiáo lù kě yǐ qù cūn zǐ ma?","Con đường này có thể đi đến làng không?",["它可能发现老鼠了。","当然可以，我给你倒一杯。","可以，一直往前走就行。"],["Tā kě néng fā xiàn lǎo shǔ le.","Dāng rán kě yǐ, wǒ gěi nǐ dǎo yì bēi.","Kě yǐ, yì zhí wǎng qián zǒu jiù xíng."],2],["Khách mua nông sản","你们卖鸡蛋吗？","Nǐ men mài jī dàn ma?","Các bạn có bán trứng gà không?",["我帮你找一下。","卖的，你要买几个？","可以，不过先让它闻闻你的手。"],["Wǒ bāng nǐ zhǎo yí xià.","Mài de, nǐ yào mǎi jǐ gè?","Kě yǐ, bú guò xiān ràng tā wén wén nǐ de shǒu."],1],["Khách mua nông sản","这些西红柿多少钱一斤？","Zhè xiē xī hóng shì duō shǎo qián yì jīn?","Cà chua này bao nhiêu tiền một cân?",["一斤五元。","它可能在床底下。","没关系，我也刚到。"],["Yì jīn wǔ yuán.","Tā kě néng zài chuáng dǐ xià.","Méi guān xì, wǒ yě gāng dào."],0],["Khách mua nông sản","我想买两篮草莓。","Wǒ xiǎng mǎi liǎng lán cǎo méi.","Tôi muốn mua hai giỏ dâu tây.",["有空的时候我会带它出去走走。","不客气，欢迎你下次再来！","好的，我给你拿。"],["Yǒu kōng de shí hòu wǒ huì dài tā chū qù zǒu zǒu.","Bú kè qì, huān yíng nǐ xià cì zài lái!","Hǎo de, wǒ gěi nǐ ná."],2],["Khách mua nông sản","这些菜新鲜吗？","Zhè xiē cài xīn xiān ma?","Rau này có tươi không?",["我喜欢种菜和照顾动物。","很新鲜，今天早上刚摘的。","抓到了，它正在门口玩呢。"],["Wǒ xǐ huan zhòng cài hé zhào gù dòng wù.","Hěn xīn xiān, jīn tiān zǎo shàng gāng zhāi de.","Zhuā dào le, tā zhèng zài mén kǒu wán ne."],1],["Khách mua nông sản","我可以买半斤吗？","Wǒ kě yǐ mǎi bàn jīn ma?","Tôi có thể mua nửa cân không?",["可以，没问题。","当然可以，请跟我来。","不太容易，每天都要喂食和清理鸡舍。"],["Kě yǐ, méi wèn tí.","Dāng rán kě yǐ, qǐng gēn wǒ lái.","Bú tài róng yì, měi tiān dōu yào wèi shí hé qīng lǐ jī shè."],0],["Khách mua nông sản","请给我三个苹果和两根黄瓜。","Qǐng gěi wǒ sān gè píng guǒ hé liǎng gēn huáng guā.","Làm ơn lấy cho tôi ba quả táo và hai quả dưa leo.",["谢谢，我刚打扫过。","我打算整理仓库和照顾动物。","好的，请稍等。"],["Xiè xiè, wǒ gāng dǎ sǎo guò.","Wǒ dǎ suàn zhěng lǐ cāng kù hé zhào gù dòng wù.","Hǎo de, qǐng shāo děng."],2],["Khách mua nông sản","一共多少钱？","Yí gòng duō shǎo qián?","Tổng cộng bao nhiêu tiền?",["我最喜欢草莓，因为又甜又香。","一共十八元。","没关系，进来吧。"],["Wǒ zuì xǐ huan cǎo méi, yīn wèi yòu tián yòu xiāng.","Yí gòng shí bā yuán.","Méi guān xì, jìn lái ba."],1],["Khách mua nông sản","可以便宜一点儿吗？","Kě yǐ pián yi yì diǎn ér ma?","Có thể rẻ hơn một chút không?",["可以，我给你打九折。","我一般早上六点起床。","当然重要，我们要节约用水。"],["Kě yǐ, wǒ gěi nǐ dǎ jiǔ zhé.","Wǒ yì bān zǎo shàng liù diǎn qǐ chuáng.","Dāng rán zhòng yào, wǒ men yào jié yuē yòng shuǐ."],0],["Khách mua nông sản","我没有零钱，可以扫码吗？","Wǒ méi yǒu líng qián, kě yǐ sǎo mǎ ma?","Tôi không có tiền lẻ, có thể quét mã không?",["我要浇菜、喂动物，还要收拾农场。","我会把垃圾放进垃圾桶。","可以，请扫这里。"],["Wǒ yào jiāo cài, wèi dòng wù, hái yào shōu shí nóng chǎng.","Wǒ huì bǎ lā jī fàng jìn lā jī tǒng.","Kě yǐ, qǐng sǎo zhè lǐ."],2],["Khách mua nông sản","我想卖一些鸡蛋，你们收吗？","Wǒ xiǎng mài yì xiē jī dàn, nǐ men shōu ma?","Tôi muốn bán một ít trứng gà, các bạn có thu mua không?",["有时候很累，但是很有意思。","收的，请问有多少个？","因为今天下雨了。"],["Yǒu shí hòu hěn lèi, dàn shì hěn yǒu yì sī.","Shōu de, qǐng wèn yǒu duō shǎo gè?","Yīn wèi jīn tiān xià yǔ le."],1],["Mua vật nuôi, hạt giống","你们这里卖小鸡吗？","Nǐ men zhè lǐ mài xiǎo jī ma?","Ở đây có bán gà con không?",["卖的，一只十元。","要看蔬菜的种类。","我想经营一个自己的农场。"],["Mài de, yì zhī shí yuán.","Yào kàn shū cài de zhǒng lèi.","Wǒ xiǎng jīng yíng yí gè zì jǐ de nóng chǎng."],0],["Mua vật nuôi, hạt giống","我想买两只小猪。","Wǒ xiǎng mǎi liǎng zhī xiǎo zhū.","Tôi muốn mua hai con heo con.",["我最喜欢羊，因为它们很温顺。","先听听客人的意见，再想办法解决。","好的，你想要多大的？"],["Wǒ zuì xǐ huan yáng, yīn wèi tā men hěn wēn shùn.","Xiān tīng tīng kè rén de yì jiàn, zài xiǎng bàn fǎ jiě jué.","Hǎo de, nǐ xiǎng yào duō dà de?"],2],["Mua vật nuôi, hạt giống","羊一只多少钱？","Yáng yì zhī duō shǎo qián?","Một con cừu giá bao nhiêu?",["我也很高兴认识你，再见！","一只三百元。","还不错，收获了很多蔬菜和水果。"],["Wǒ yě hěn gāo xìng rèn shi nǐ, zài jiàn!","Yì zhī sān bǎi yuán.","Hái bú cuò, shōu huò le hěn duō shū cài hé shuǐ guǒ."],1],["Mua vật nuôi, hạt giống","我想买一头奶牛。","Wǒ xiǎng mǎi yì tóu nǎi niú.","Tôi muốn mua một con bò sữa.",["好的，我们可以帮你安排。","因为它们可以提供不同的农产品。","谢谢，我喝水就可以了。"],["Hǎo de, wǒ men kě yǐ bāng nǐ ān pái.","Yīn wèi tā men kě yǐ tí gōng bù tóng de nóng chǎn pǐn.","Xiè xiè, wǒ hē shuǐ jiù kě yǐ le."],0],["Mua vật nuôi, hạt giống","这些种子适合什么时候种？","Zhè xiē zhǒng zi shì hé shén me shí hòu zhǒng?","Những hạt giống này thích hợp trồng lúc nào?",["如果雨水充足，就不用浇了。","吃过了，谢谢你。","春天和天气温暖的时候都可以。"],["Rú guǒ yǔ shuǐ chōng zú, jiù bú yòng jiāo le.","Chī guò le, xiè xiè nǐ.","Chūn tiān hé tiān qì wēn nuǎn de shí hòu dōu kě yǐ."],2],["Mua vật nuôi, hạt giống","有没有胡萝卜种子？","Yǒu méi yǒu hú luó bo zhǒng zi?","Có hạt giống cà rốt không?",["好啊，看起来很新鲜！","有，在左边的架子上。","每天要准备足够的草和干净的水。"],["Hǎo a, kàn qǐ lái hěn xīn xiān!","Yǒu, zài zuǒ biān de jià zi shàng.","Měi tiān yào zhǔn bèi zú gòu de cǎo hé gān jìng de shuǐ."],1],["Mua vật nuôi, hạt giống","我需要买一些饲料。","Wǒ xū yào mǎi yì xiē sì liào.","Tôi cần mua một ít thức ăn chăn nuôi.",["好的，你需要几袋？","我想种更多水果，也想养更多鱼。","是我做的，希望你喜欢。"],["Hǎo de, nǐ xū yào jǐ dài?","Wǒ xiǎng zhǒng gèng duō shuǐ guǒ, yě xiǎng yǎng gèng duō yú.","Shì wǒ zuò de, xī wàng nǐ xǐ huan."],0],["Mua vật nuôi, hạt giống","一袋饲料够喂六只鸡吗？","Yí dài sì liào gòu wèi liù zhī jī ma?","Một túi thức ăn có đủ cho sáu con gà không?",["你好，请问有什么事？","很好吃，谢谢！","要看每袋的重量和喂食量。"],["Nǐ hǎo, qǐng wèn yǒu shén me shì?","Hěn hǎo chī, xiè xiè!","Yào kàn měi dài de zhòng liàng hé wèi shí liàng."],2],["Mua vật nuôi, hạt giống","买回去以后，怎么照顾小鸡？","Mǎi huí qù yǐ hòu, zěn me zhào gù xiǎo jī?","Sau khi mua về, chăm sóc gà con thế nào?",["好啊，我走累了。","每天给它们准备食物和干净的水。","真的吗？运费怎么算？"],["Hǎo a, wǒ zǒu lèi le.","Měi tiān gěi tā men zhǔn bèi shí wù hé gān jìng de shuǐ.","Zhēn de ma? yùn fèi zěn me suàn?"],1],["Mua vật nuôi, hạt giống","你们有猫可以买吗？","Nǐ men yǒu māo kě yǐ mǎi ma?","Ở đây có mèo để mua không?",["有，猫可以在家里活动，也能帮忙抓老鼠。","可以，请介绍一下。","不做了，我准备休息。"],["Yǒu, māo kě yǐ zài jiā lǐ huó dòng, yě néng bāng máng zhuā lǎo shǔ.","Kě yǐ, qǐng jiè shào yí xià.","Bú zuò le, wǒ zhǔn bèi xiū xi."],0],["Thú cưng trong nhà","你家有狗吗？","Nǐ jiā yǒu gǒu ma?","Nhà bạn có chó không?",["听起来不错，我考虑一下。","在，欢迎你明天再来。","有，它常常在屋子周围跑。"],["Tīng qǐ lái bú cuò, wǒ kǎo lǜ yí xià.","Zài, huān yíng nǐ míng tiān zài lái.","Yǒu, tā cháng cháng zài wū zi zhōu wéi pǎo."],2],["Thú cưng trong nhà","这只猫叫什么名字？","Zhè zhī māo jiào shén me míng zì?","Con mèo này tên là gì?",["很开心，谢谢你的招待。","它叫小白。","太好了，什么时候可以来？"],["Hěn kāi xīn, xiè xiè nǐ de zhāo dài.","Tā jiào xiǎo bái.","Tài hǎo le, shén me shí hòu kě yǐ lái?"],1],["Thú cưng trong nhà","猫为什么一直看着墙角？","Māo wèi shén me yì zhí kàn zhe qiáng jiǎo?","Sao con mèo cứ nhìn vào góc tường vậy?",["它可能发现老鼠了。","暂时不用，谢谢。","好的，路上小心，再见！"],["Tā kě néng fā xiàn lǎo shǔ le.","Zàn shí bú yòng, xiè xiè.","Hǎo de, lù shang xiǎo xīn, zài jiàn!"],0],["Thú cưng trong nhà","你的狗真可爱，可以摸摸它吗？","Nǐ de gǒu zhēn kě ài, kě yǐ mō mō tā ma?","Chó của bạn dễ thương quá, tôi có thể vuốt ve nó không?",["在哪里举办？","你好！欢迎来我的农场。","可以，不过先让它闻闻你的手。"],["Zài nǎ lǐ jǔ bàn?","Nǐ hǎo! huān yíng lái wǒ de nóng chǎng.","Kě yǐ, bú guò xiān ràng tā wén wén nǐ de shǒu."],2],["Thú cưng trong nhà","小猫跑到哪里去了？","Xiǎo māo pǎo dào nǎ lǐ qù le?","Mèo con chạy đi đâu rồi?",["当然可以，欢迎！","它可能在床底下。","愿意，请告诉我时间和地点。"],["Dāng rán kě yǐ, huān yíng!","Tā kě néng zài chuáng dǐ xià.","Yuàn yì, qǐng gào sù wǒ shí jiān hé dì diǎn."],1],["Thú cưng trong nhà","你每天都带狗出去散步吗？","Nǐ měi tiān dōu dài gǒu chū qù sàn bù ma?","Ngày nào bạn cũng dắt chó ra ngoài đi dạo à?",["有空的时候我会带它出去走走。","好的，谢谢你。","今天不太忙，你呢？"],["Yǒu kōng de shí hòu wǒ huì dài tā chū qù zǒu zǒu.","Hǎo de, xiè xiè nǐ.","Jīn tiān bú tài máng, nǐ ne?"],0],["Thú cưng trong nhà","猫抓到老鼠了吗？","Māo zhuā dào lǎo shǔ le ma?","Mèo bắt được chuột chưa?",["好的，我有需要再联系你。","谢谢你！","抓到了，它正在门口玩呢。"],["Hǎo de, wǒ yǒu xū yào zài lián xì nǐ.","Xiè xiè nǐ!","Zhuā dào le, tā zhèng zài mén kǒu wán ne."],2],["Thú cưng trong nhà","我可以看看你的厨房吗？","Wǒ kě yǐ kàn kàn nǐ de chú fáng ma?","Tôi có thể xem nhà bếp của bạn không?",["欢迎你！我带你参观一下。","当然可以，请跟我来。","没关系，旁边有水可以洗鞋。"],["Huān yíng nǐ! wǒ dài nǐ cān guān yí xià.","Dāng rán kě yǐ, qǐng gēn wǒ lái.","Méi guān xì, páng biān yǒu shuǐ kě yǐ xǐ xié."],1],["Thú cưng trong nhà","你家真干净！","Nǐ jiā zhēn gān jìng!","Nhà bạn sạch thật!",["谢谢，我刚打扫过。","别着急，我帮你找找。","我在这里住了三年。"],["Xiè xiè, wǒ gāng dǎ sǎo guò.","Bié zháo jí, wǒ bāng nǐ zhǎo zhǎo.","Wǒ zài zhè lǐ zhù le sān nián."],0],["Thú cưng trong nhà","不好意思，我的鞋子有点儿脏。","Bù hǎo yì si, wǒ de xié zǐ yǒu diǎn er zāng.","Xin lỗi, giày của tôi hơi bẩn.",["我来把它送回鸡舍。","是啊，很适合在农场散步。","没关系，进来吧。"],["Wǒ lái bǎ tā sòng huí jī shè.","Shì a, hěn shì hé zài nóng chǎng sàn bù.","Méi guān xì, jìn lái ba."],2],["Trò chuyện về nông trại","你每天几点起床？","Nǐ měi tiān jǐ diǎn qǐ chuáng?","Mỗi ngày bạn thức dậy lúc mấy giờ?",["有，请问有什么事？","我一般早上六点起床。","是啊，它真能干！"],["Yǒu, qǐng wèn yǒu shén me shì?","Wǒ yì bān zǎo shàng liù diǎn qǐ chuáng.","Shì a, tā zhēn néng gàn!"],1],["Trò chuyện về nông trại","你每天都要做哪些工作？","Nǐ měi tiān dōu yào zuò nǎ xiē gōng zuò?","Mỗi ngày bạn phải làm những công việc gì?",["我要浇菜、喂动物，还要收拾农场。","好，我们先在屋里休息。","不用谢，欢迎下次再来。"],["Wǒ yào jiāo cài, wèi dòng wù, hái yào shōu shí nóng chǎng.","Hǎo, wǒ men xiān zài wū lǐ xiū xi.","Bú yòng xiè, huān yíng xià cì zài lái."],0],["Trò chuyện về nông trại","今天为什么不用浇水？","Jīn tiān wèi shén me bú yòng jiāo shuǐ?","Hôm nay tại sao không cần tưới nước?",["我先把东西放回仓库。","是啊，每天都有很多事情要做。","因为今天下雨了。"],["Wǒ xiān bǎ dōng xī fàng huí cāng kù.","Shì a, měi tiān dōu yǒu hěn duō shì qíng yào zuò.","Yīn wèi jīn tiān xià yǔ le."],2],["Trò chuyện về nông trại","这些蔬菜要几天才能成熟？","Zhè xiē shū cài yào jǐ tiān cái néng chéng shú?","Những loại rau này cần mấy ngày mới chín?",["商店在房子右边。","要看蔬菜的种类。","当然可以，我给你倒一杯。"],["Shāng diàn zài fáng zi yòu biān.","Yào kàn shū cài de zhǒng lèi.","Dāng rán kě yǐ, wǒ gěi nǐ dǎo yì bēi."],1],["Trò chuyện về nông trại","你最喜欢农场里的什么动物？","Nǐ zuì xǐ huan nóng chǎng lǐ de shén me dòng wù?","Bạn thích con vật nào nhất trong nông trại?",["我最喜欢羊，因为它们很温顺。","我帮你找一下。","水井在菜园旁边。"],["Wǒ zuì xǐ huan yáng, yīn wèi tā men hěn wēn shùn.","Wǒ bāng nǐ zhǎo yí xià.","Shuǐ jǐng zài cài yuán páng biān."],0],["Trò chuyện về nông trại","今年的收成怎么样？","Jīn nián de shōu chéng zěn me yàng?","Năm nay thu hoạch thế nào?",["没关系，我也刚到。","请从那边的小路走。","还不错，收获了很多蔬菜和水果。"],["Méi guān xì, wǒ yě gāng dào.","Qǐng cóng nà biān de xiǎo lù zǒu.","Hái bú cuò, shōu huò le hěn duō shū cài hé shuǐ guǒ."],2],["Trò chuyện về nông trại","你为什么要养这么多动物？","Nǐ wèi shén me yào yǎng zhè me duō dòng wù?","Tại sao bạn nuôi nhiều động vật như vậy?",["在房子后面。","因为它们可以提供不同的农产品。","不客气，欢迎你下次再来！"],["Zài fáng zi hòu miàn.","Yīn wèi tā men kě yǐ tí gōng bù tóng de nóng chǎn pǐn.","Bú kè qì, huān yíng nǐ xià cì zài lái!"],1],["Trò chuyện về nông trại","下雨天你还需要给菜浇水吗？","Xià yǔ tiān nǐ hái xū yào gěi cài jiāo shuǐ ma?","Ngày mưa bạn còn cần tưới rau không?",["如果雨水充足，就不用浇了。","我喜欢种菜和照顾动物。","不远，沿着这条路走就到了。"],["Rú guǒ yǔ shuǐ chōng zú, jiù bú yòng jiāo le.","Wǒ xǐ huan zhòng cài hé zhào gù dòng wù.","Bù yuǎn, yán zhe zhè tiáo lù zǒu jiù dào le."],0],["Trò chuyện về nông trại","你觉得养牛最麻烦的是什么？","Nǐ jué de yǎng niú zuì má fán de shì shén me?","Bạn thấy nuôi bò phiền nhất ở điểm nào?",["不太容易，每天都要喂食和清理鸡舍。","当然可以，你想去哪里？","每天要准备足够的草和干净的水。"],["Bú tài róng yì, měi tiān dōu yào wèi shí hé qīng lǐ jī shè.","Dāng rán kě yǐ, nǐ xiǎng qù nǎ lǐ?","Měi tiān yào zhǔn bèi zú gòu de cǎo hé gān jìng de shuǐ."],2],["Trò chuyện về nông trại","你以后还想在农场里增加什么？","Nǐ yǐ hòu hái xiǎng zài nóng chǎng lǐ zēng jiā shén me?","Sau này bạn còn muốn thêm gì vào nông trại?",["鸡舍在房子旁边。","我想种更多水果，也想养更多鱼。","我打算整理仓库和照顾动物。"],["Jī shè zài fáng zi páng biān.","Wǒ xiǎng zhǒng gèng duō shuǐ guǒ, yě xiǎng yǎng gèng duō yú.","Wǒ dǎ suàn zhěng lǐ cāng kù hé zhào gù dòng wù."],1],["Khách quảng cáo, dịch vụ","你好，我是送货公司的工作人员。","Nǐ hǎo, wǒ shì sòng huò gōng sī de gōng zuò rén yuán.","Xin chào, tôi là nhân viên công ty giao hàng.",["你好，请问有什么事？","我最喜欢草莓，因为又甜又香。","出口在那条小路的尽头。"],["Nǐ hǎo, qǐng wèn yǒu shén me shì?","Wǒ zuì xǐ huan cǎo méi, yīn wèi yòu tián yòu xiāng.","Chū kǒu zài nà tiáo xiǎo lù de jìn tóu."],0],["Khách quảng cáo, dịch vụ","我们可以帮你把农产品送到市场。","Wǒ men kě yǐ bāng nǐ bǎ nóng chǎn pǐn sòng dào shì chǎng.","Chúng tôi có thể giúp bạn chuyển nông sản ra chợ.",["当然重要，我们要节约用水。","大概五分钟。","真的吗？运费怎么算？"],["Dāng rán zhòng yào, wǒ men yào jié yuē yòng shuǐ.","Dà gài wǔ fēn zhōng.","Zhēn de ma? yùn fèi zěn me suàn?"],2],["Khách quảng cáo, dịch vụ","我们有一种新的动物饲料，你想了解吗？","Wǒ men yǒu yì zhǒng xīn de dòng wù sì liào, nǐ xiǎng liǎo jiě ma?","Chúng tôi có loại thức ăn chăn nuôi mới, bạn muốn tìm hiểu không?",["可以，一直往前走就行。","可以，请介绍一下。","我会把垃圾放进垃圾桶。"],["Kě yǐ, yì zhí wǎng qián zǒu jiù xíng.","Kě yǐ, qǐng jiè shào yí xià.","Wǒ huì bǎ lā jī fàng jìn lā jī tǒng."],1],["Khách quảng cáo, dịch vụ","买十袋饲料可以打九折。","Mǎi shí dài sì liào kě yǐ dǎ jiǔ zhé.","Mua mười túi thức ăn có thể được giảm 10%.",["听起来不错，我考虑一下。","有时候很累，但是很有意思。","卖的，你要买几个？"],["Tīng qǐ lái bú cuò, wǒ kǎo lǜ yí xià.","Yǒu shí hòu hěn lèi, dàn shì hěn yǒu yì sī.","Mài de, nǐ yào mǎi jǐ gè?"],0],["Khách quảng cáo, dịch vụ","我们可以帮你修理水泵。","Wǒ men kě yǐ bāng nǐ xiū lǐ shuǐ bèng.","Chúng tôi có thể giúp bạn sửa máy bơm nước.",["我想经营一个自己的农场。","一斤五元。","太好了，什么时候可以来？"],["Wǒ xiǎng jīng yíng yí gè zì jǐ de nóng chǎng.","Yì jīn wǔ yuán.","Tài hǎo le, shén me shí hòu kě yǐ lái?"],2],["Khách quảng cáo, dịch vụ","你需要订购新的种子吗？","Nǐ xū yào dìng gòu xīn de zhǒng zi ma?","Bạn có cần đặt mua hạt giống mới không?",["好的，我给你拿。","暂时不用，谢谢。","先听听客人的意见，再想办法解决。"],["Hǎo de, wǒ gěi nǐ ná.","Zàn shí bú yòng, xiè xiè.","Xiān tīng tīng kè rén de yì jiàn, zài xiǎng bàn fǎ jiě jué."],1],["Khách quảng cáo, dịch vụ","我们下周有一个农产品展销会。","Wǒ men xià zhōu yǒu yí gè nóng chǎn pǐn zhǎn xiāo huì.","Tuần sau chúng tôi có hội chợ nông sản.",["在哪里举办？","我也很高兴认识你，再见！","很新鲜，今天早上刚摘的。"],["Zài nǎ lǐ jǔ bàn?","Wǒ yě hěn gāo xìng rèn shi nǐ, zài jiàn!","Hěn xīn xiān, jīn tiān zǎo shàng gāng zhāi de."],0],["Khách quảng cáo, dịch vụ","你愿意参加我们的农场交流活动吗？","Nǐ yuàn yì cān jiā wǒ men de nóng chǎng jiāo liú huó dòng ma?","Bạn có muốn tham gia hoạt động giao lưu nông trại của chúng tôi không?",["谢谢，我喝水就可以了。","可以，没问题。","愿意，请告诉我时间和地点。"],["Xiè xiè, wǒ hē shuǐ jiù kě yǐ le.","Kě yǐ, méi wèn tí.","Yuàn yì, qǐng gào sù wǒ shí jiān hé dì diǎn."],2],["Khách quảng cáo, dịch vụ","这是我们的宣传单，你可以看看。","Zhè shì wǒ men de xuān chuán dān, nǐ kě yǐ kàn kàn.","Đây là tờ quảng cáo của chúng tôi, bạn có thể xem.",["好的，请稍等。","好的，谢谢你。","吃过了，谢谢你。"],["Hǎo de, qǐng shāo děng.","Hǎo de, xiè xiè nǐ.","Chī guò le, xiè xiè nǐ."],1],["Khách quảng cáo, dịch vụ","如果你有兴趣，可以给我们打电话。","Rú guǒ nǐ yǒu xìng qù, kě yǐ gěi wǒ men dǎ diàn huà.","Nếu bạn quan tâm, có thể gọi điện cho chúng tôi.",["好的，我有需要再联系你。","好啊，看起来很新鲜！","一共十八元。"],["Hǎo de, wǒ yǒu xū yào zài lián xì nǐ.","Hǎo a, kàn qǐ lái hěn xīn xiān!","Yí gòng shí bā yuán."],0],["Tình huống bất ngờ","不好意思，我不小心踩到泥巴了。","Bù hǎo yì si, wǒ bù xiǎo xīn cǎi dào ní bā le.","Xin lỗi, tôi vô tình giẫm phải bùn.",["是我做的，希望你喜欢。","可以，我给你打九折。","没关系，旁边有水可以洗鞋。"],["Shì wǒ zuò de, xī wàng nǐ xǐ huan.","Kě yǐ, wǒ gěi nǐ dǎ jiǔ zhé.","Méi guān xì, páng biān yǒu shuǐ kě yǐ xǐ xié."],2],["Tình huống bất ngờ","哎呀，我的帽子被风吹走了！","Āi yā, wǒ de mào zi bèi fēng chuī zǒu le!","Ôi, mũ của tôi bị gió thổi bay mất rồi!",["可以，请扫这里。","别着急，我帮你找找。","很好吃，谢谢！"],["Kě yǐ, qǐng sǎo zhè lǐ.","Bié zháo jí, wǒ bāng nǐ zhǎo zhǎo.","Hěn hǎo chī, xiè xiè!"],1],["Tình huống bất ngờ","这里有一只小鸡跑出来了！","Zhè lǐ yǒu yì zhī xiǎo jī pǎo chū lái le!","Có một con gà con chạy ra ngoài này!",["我来把它送回鸡舍。","好啊，我走累了。","收的，请问有多少个？"],["Wǒ lái bǎ tā sòng huí jī shè.","Hǎo a, wǒ zǒu lèi le.","Shōu de, qǐng wèn yǒu duō shǎo gè?"],0],["Tình huống bất ngờ","你的猫好像抓到老鼠了！","Nǐ de māo hǎo xiàng zhuā dào lǎo shǔ le!","Hình như mèo của bạn bắt được chuột rồi!",["不做了，我准备休息。","卖的，一只十元。","是啊，它真能干！"],["Bú zuò le, wǒ zhǔn bèi xiū xi.","Mài de, yì zhī shí yuán.","Shì a, tā zhēn néng gàn!"],2],["Tình huống bất ngờ","外面雨下得很大，我们等一会儿吧。","Wài miàn yǔ xià dé hěn dà, wǒ men děng yí huì er ba.","Ngoài trời mưa to, chúng ta đợi một lát nhé.",["好的，你想要多大的？","好，我们先在屋里休息。","在，欢迎你明天再来。"],["Hǎo de, nǐ xiǎng yào duō dà de?","Hǎo, wǒ men xiān zài wū lǐ xiū xi.","Zài, huān yíng nǐ míng tiān zài lái."],1],["Tình huống bất ngờ","你的背包好像装不下这些东西了。","Nǐ de bēi bāo hǎo xiàng zhuāng bú xià zhè xiē dōng xī le.","Ba lô của bạn hình như không chứa hết những thứ này.",["我先把东西放回仓库。","很开心，谢谢你的招待。","一只三百元。"],["Wǒ xiān bǎ dōng xī fàng huí cāng kù.","Hěn kāi xīn, xiè xiè nǐ de zhāo dài.","Yì zhī sān bǎi yuán."],0],["Tình huống bất ngờ","我有点儿渴，可以喝点儿水吗？","Wǒ yǒu diǎn er kě, kě yǐ hē diǎn ér shuǐ ma?","Tôi hơi khát, có thể uống chút nước không?",["好的，路上小心，再见！","好的，我们可以帮你安排。","当然可以，我给你倒一杯。"],["Hǎo de, lù shang xiǎo xīn, zài jiàn!","Hǎo de, wǒ men kě yǐ bāng nǐ ān pái.","Dāng rán kě yǐ, wǒ gěi nǐ dǎo yì bēi."],2],["Tình huống bất ngờ","我好像把手机忘在你家了。","Wǒ hǎo xiàng bǎ shǒu jī wàng zài nǐ jiā le.","Hình như tôi để quên điện thoại ở nhà bạn rồi.",["春天和天气温暖的时候都可以。","我帮你找一下。","你好！欢迎来我的农场。"],["Chūn tiān hé tiān qì wēn nuǎn de shí hòu dōu kě yǐ.","Wǒ bāng nǐ zhǎo yí xià.","Nǐ hǎo! huān yíng lái wǒ de nóng chǎng."],1],["Tình huống bất ngờ","不好意思，我来晚了。","Bù hǎo yì si, wǒ lái wǎn le.","Xin lỗi, tôi đến muộn rồi.",["没关系，我也刚到。","当然可以，欢迎！","有，在左边的架子上。"],["Méi guān xì, wǒ yě gāng dào.","Dāng rán kě yǐ, huān yíng!","Yǒu, zài zuǒ biān de jià zi shàng."],0],["Tình huống bất ngờ","谢谢你今天的招待！","Xiè xiè nǐ jīn tiān de zhāo dài!","Cảm ơn bạn đã tiếp đón hôm nay!",["今天不太忙，你呢？","好的，你需要几袋？","不客气，欢迎你下次再来！"],["Jīn tiān bú tài máng, nǐ ne?","Hǎo de, nǐ xū yào jǐ dài?","Bú kè qì, huān yíng nǐ xià cì zài lái!"],2],["Ý kiến, sở thích, giao tiếp mở rộng","你平时喜欢做什么？","Nǐ píng shí xǐ huan zuò shén me?","Bình thường bạn thích làm gì?",["要看每袋的重量和喂食量。","我喜欢种菜和照顾动物。","谢谢你！"],["Yào kàn měi dài de zhòng liàng hé wèi shí liàng.","Wǒ xǐ huan zhòng cài hé zhào gù dòng wù.","Xiè xiè nǐ!"],1],["Ý kiến, sở thích, giao tiếp mở rộng","你觉得养鸡容易吗？","Nǐ jué de yǎng jī róng yì ma?","Bạn thấy nuôi gà có dễ không?",["不太容易，每天都要喂食和清理鸡舍。","欢迎你！我带你参观一下。","每天给它们准备食物和干净的水。"],["Bú tài róng yì, měi tiān dōu yào wèi shí hé qīng lǐ jī shè.","Huān yíng nǐ! wǒ dài nǐ cān guān yí xià.","Měi tiān gěi tā men zhǔn bèi shí wù hé gān jìng de shuǐ."],0],["Ý kiến, sở thích, giao tiếp mở rộng","如果明天下雨，你打算做什么？","Rú guǒ míng tiān xià yǔ, nǐ dǎ suàn zuò shén me?","Nếu ngày mai trời mưa, bạn dự định làm gì?",["我在这里住了三年。","有，猫可以在家里活动，也能帮忙抓老鼠。","我打算整理仓库和照顾动物。"],["Wǒ zài zhè lǐ zhù le sān nián.","Yǒu, māo kě yǐ zài jiā lǐ huó dòng, yě néng bāng máng zhuā lǎo shǔ.","Wǒ dǎ suàn zhěng lǐ cāng kù hé zhào gù dòng wù."],2],["Ý kiến, sở thích, giao tiếp mở rộng","你最喜欢吃什么水果？","Nǐ zuì xǐ huan chī shén me shuǐ guǒ?","Bạn thích ăn loại trái cây nào nhất?",["有，它常常在屋子周围跑。","我最喜欢草莓，因为又甜又香。","是啊，很适合在农场散步。"],["Yǒu, tā cháng cháng zài wū zi zhōu wéi pǎo.","Wǒ zuì xǐ huan cǎo méi, yīn wèi yòu tián yòu xiāng.","Shì a, hěn shì hé zài nóng chǎng sàn bù."],1],["Ý kiến, sở thích, giao tiếp mở rộng","你认为保护环境重要吗？","Nǐ rèn wéi bǎo hù huán jìng zhòng yào ma?","Bạn có cho rằng bảo vệ môi trường quan trọng không?",["当然重要，我们要节约用水。","有，请问有什么事？","它叫小白。"],["Dāng rán zhòng yào, wǒ men yào jié yuē yòng shuǐ.","Yǒu, qǐng wèn yǒu shén me shì?","Tā jiào xiǎo bái."],0],["Ý kiến, sở thích, giao tiếp mở rộng","你会把垃圾扔在哪里？","Nǐ huì bǎ lā jī rēng zài nǎ lǐ?","Bạn sẽ vứt rác ở đâu?",["不用谢，欢迎下次再来。","它可能发现老鼠了。","我会把垃圾放进垃圾桶。"],["Bú yòng xiè, huān yíng xià cì zài lái.","Tā kě néng fā xiàn lǎo shǔ le.","Wǒ huì bǎ lā jī fàng jìn lā jī tǒng."],2],["Ý kiến, sở thích, giao tiếp mở rộng","你觉得在农场工作累不累？","Nǐ jué de zài nóng chǎng gōng zuò lèi bu lèi?","Bạn thấy làm việc ở nông trại có mệt không?",["可以，不过先让它闻闻你的手。","有时候很累，但是很有意思。","是啊，每天都有很多事情要做。"],["Kě yǐ, bú guò xiān ràng tā wén wén nǐ de shǒu.","Yǒu shí hòu hěn lèi, dàn shì hěn yǒu yì sī.","Shì a, měi tiān dōu yǒu hěn duō shì qíng yào zuò."],1],["Ý kiến, sở thích, giao tiếp mở rộng","你长大以后想做什么？","Nǐ zhǎng dà yǐ hòu xiǎng zuò shén me?","Lớn lên bạn muốn làm nghề gì?",["我想经营一个自己的农场。","商店在房子右边。","它可能在床底下。"],["Wǒ xiǎng jīng yíng yí gè zì jǐ de nóng chǎng.","Shāng diàn zài fáng zi yòu biān.","Tā kě néng zài chuáng dǐ xià."],0],["Ý kiến, sở thích, giao tiếp mở rộng","如果客人不满意，你应该怎么办？","Rú guǒ kè rén bù mǎn yì, nǐ yīng gāi zěn me bàn?","Nếu khách không hài lòng, bạn nên làm gì?",["水井在菜园旁边。","有空的时候我会带它出去走走。","先听听客人的意见，再想办法解决。"],["Shuǐ jǐng zài cài yuán páng biān.","Yǒu kōng de shí hòu wǒ huì dài tā chū qù zǒu zǒu.","Xiān tīng tīng kè rén de yì jiàn, zài xiǎng bàn fǎ jiě jué."],2],["Ý kiến, sở thích, giao tiếp mở rộng","很高兴认识你，希望以后还能见面。","Hěn gāo xìng rèn shi nǐ, xī wàng yǐ hòu hái néng jiàn miàn.","Rất vui được quen bạn, hy vọng sau này còn gặp lại.",["抓到了，它正在门口玩呢。","我也很高兴认识你，再见！","请从那边的小路走。"],["Zhuā dào le, tā zhèng zài mén kǒu wán ne.","Wǒ yě hěn gāo xìng rèn shi nǐ, zài jiàn!","Qǐng cóng nà biān de xiǎo lù zǒu."],1],["Ăn uống, sinh hoạt, mời khách","你喝茶还是喝水？","Nǐ hē chá hái shì hē shuǐ?","Bạn uống trà hay uống nước?",["谢谢，我喝水就可以了。","在房子后面。","当然可以，请跟我来。"],["Xiè xiè, wǒ hē shuǐ jiù kě yǐ le.","Zài fáng zi hòu miàn.","Dāng rán kě yǐ, qǐng gēn wǒ lái."],0],["Ăn uống, sinh hoạt, mời khách","你吃过饭了吗？","Nǐ chī guò fàn le ma?","Bạn ăn cơm chưa?",["不远，沿着这条路走就到了。","谢谢，我刚打扫过。","吃过了，谢谢你。"],["Bù yuǎn, yán zhe zhè tiáo lù zǒu jiù dào le.","Xiè xiè, wǒ gāng dǎ sǎo guò.","Chī guò le, xiè xiè nǐ."],2],["Ăn uống, sinh hoạt, mời khách","要不要尝尝我刚摘的草莓？","Yào bu yào cháng cháng wǒ gāng zhāi de cǎo méi?","Bạn có muốn thử dâu tây tôi vừa hái không?",["没关系，进来吧。","好啊，看起来很新鲜！","当然可以，你想去哪里？"],["Méi guān xì, jìn lái ba.","Hǎo a, kàn qǐ lái hěn xīn xiān!","Dāng rán kě yǐ, nǐ xiǎng qù nǎ lǐ?"],1],["Ăn uống, sinh hoạt, mời khách","这道菜是谁做的？","Zhè dào cài shì shuí zuò de?","Món này ai nấu vậy?",["是我做的，希望你喜欢。","鸡舍在房子旁边。","我一般早上六点起床。"],["Shì wǒ zuò de, xī wàng nǐ xǐ huan.","Jī shè zài fáng zi páng biān.","Wǒ yì bān zǎo shàng liù diǎn qǐ chuáng."],0],["Ăn uống, sinh hoạt, mời khách","味道怎么样？","Wèi dào zěn me yàng?","Mùi vị thế nào?",["出口在那条小路的尽头。","我要浇菜、喂动物，还要收拾农场。","很好吃，谢谢！"],["Chū kǒu zài nà tiáo xiǎo lù de jìn tóu.","Wǒ yào jiāo cài, wèi dòng wù, hái yào shōu shí nóng chǎng.","Hěn hǎo chī, xiè xiè!"],2],["Ăn uống, sinh hoạt, mời khách","你要不要在这里休息一会儿？","Nǐ yào bu yào zài zhè lǐ xiū xi yí huì er?","Bạn có muốn nghỉ ở đây một lát không?",["因为今天下雨了。","好啊，我走累了。","大概五分钟。"],["Yīn wèi jīn tiān xià yǔ le.","Hǎo a, wǒ zǒu lèi le.","Dà gài wǔ fēn zhōng."],1],["Ăn uống, sinh hoạt, mời khách","你晚上还要工作吗？","Nǐ wǎn shàng hái yào gōng zuò ma?","Buổi tối bạn còn phải làm việc không?",["不做了，我准备休息。","可以，一直往前走就行。","要看蔬菜的种类。"],["Bú zuò le, wǒ zhǔn bèi xiū xi.","Kě yǐ, yì zhí wǎng qián zǒu jiù xíng.","Yào kàn shū cài de zhǒng lèi."],0],["Ăn uống, sinh hoạt, mời khách","明天你还在农场吗？","Míng tiān nǐ hái zài nóng chǎng ma?","Ngày mai bạn vẫn ở nông trại chứ?",["卖的，你要买几个？","我最喜欢羊，因为它们很温顺。","在，欢迎你明天再来。"],["Mài de, nǐ yào mǎi jǐ gè?","Wǒ zuì xǐ huan yáng, yīn wèi tā men hěn wēn shùn.","Zài, huān yíng nǐ míng tiān zài lái."],2],["Ăn uống, sinh hoạt, mời khách","今天玩得开心吗？","Jīn tiān wán dé kāi xīn ma?","Hôm nay bạn chơi vui không?",["还不错，收获了很多蔬菜和水果。","很开心，谢谢你的招待。","一斤五元。"],["Hái bú cuò, shōu huò le hěn duō shū cài hé shuǐ guǒ.","Hěn kāi xīn, xiè xiè nǐ de zhāo dài.","Yì jīn wǔ yuán."],1],["Ăn uống, sinh hoạt, mời khách","时间不早了，我该回家了。","Shí jiān bù zǎo le, wǒ gāi huí jiā le.","Không còn sớm nữa, tôi phải về nhà rồi.",["好的，路上小心，再见！","好的，我给你拿。","因为它们可以提供不同的农产品。"],["Hǎo de, lù shang xiǎo xīn, zài jiàn!","Hǎo de, wǒ gěi nǐ ná.","Yīn wèi tā men kě yǐ tí gōng bù tóng de nóng chǎn pǐn."],0]];

/**
 * 我的农场 · Nông Trại Của Tôi — bản 2.1 theo tài liệu thiết kế (Prompt_Game_My_Farm_Wo_De_Nongchang)
 *   - Bản đồ 2D nhìn từ trên xuống, chia ô vuông; điều khiển point-and-click, nhân vật tự tìm đường (A*) đi từng ô.
 *   - Không cấp độ / EXP / nhiệm vụ hằng ngày / xưởng chế biến. Tiến trình = 10 MỐC PHÁT TRIỂN mở quyền mua & khu vực.
 *   - Ngày chỉ qua khi lên giường ngủ. Thời tiết 晴 / 阴 / 雨 (mưa tự tưới). Năng lượng 100, ăn món ăn để hồi.
 *   - Khu vực: nông trại chính (nhà, giếng, vườn rau, 4 chuồng, chợ, lối ra sau nhà) · trong nhà · trong chuồng · rừng sau nhà (vườn cây, ao cá).
 *   - NPC ngẫu nhiên ở cổng, hội thoại có lựa chọn; sổ tay từ vựng 10 nhóm có tìm kiếm & phát âm.
 * Lưu ý: file này còn được nạp dạng <script> thường khi mở bằng file:// → không dùng import/export.
 */

// ============================================================================
// 1. ÂM THANH
// ============================================================================
class FarmAudio {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.voiceEnabled = true;
    this.voices = [];
    if ('speechSynthesis' in window) {
      const load = () => { try { this.voices = window.speechSynthesis.getVoices(); } catch (e) {} };
      load();
      try { window.speechSynthesis.onvoiceschanged = load; } catch (e) {}
    }
  }
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { try { this.ctx = new AC(); } catch (e) { this.ctx = null; } }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }
  tone(freq, dur, { type = 'sine', vol = 0.25, delay = 0, slideTo = null } = {}) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  pop() { this.tone(420, 0.09, { slideTo: 700, vol: 0.2 }); }
  step() { this.tone(180, 0.04, { type: 'triangle', vol: 0.05 }); }
  dig() { this.tone(140, 0.14, { type: 'sawtooth', vol: 0.1, slideTo: 90 }); }
  plant() { this.tone(260, 0.12, { type: 'triangle', slideTo: 180, vol: 0.22 }); }
  water() { this.tone(900, 0.18, { type: 'sine', vol: 0.12, slideTo: 300 }); this.tone(700, 0.15, { vol: 0.08, delay: 0.08, slideTo: 250 }); }
  harvest() { this.tone(660, 0.1, { type: 'triangle', vol: 0.2 }); this.tone(990, 0.12, { type: 'triangle', vol: 0.16, delay: 0.07 }); }
  cluck() { this.tone(900, 0.06, { type: 'square', vol: 0.08, slideTo: 600 }); this.tone(900, 0.06, { type: 'square', vol: 0.08, slideTo: 600, delay: 0.1 }); }
  coin() { this.tone(1800, 0.12, { vol: 0.16 }); this.tone(2400, 0.12, { vol: 0.14, delay: 0.03 }); }
  error() { this.tone(160, 0.3, { type: 'sawtooth', vol: 0.2, slideTo: 110 }); }
  door() { this.tone(300, 0.12, { type: 'triangle', vol: 0.15, slideTo: 200 }); }
  splash() { this.tone(500, 0.25, { type: 'sine', vol: 0.15, slideTo: 120 }); }
  unlock() { [659.25, 880, 1174.66].forEach((f, i) => this.tone(f, 0.28, { type: 'triangle', vol: 0.2, delay: i * 0.09 })); }
  fanfare() { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.tone(f, 0.4, { type: 'triangle', vol: 0.22, delay: i * 0.11 })); }
  sleep() { [523.25, 440, 349.23].forEach((f, i) => this.tone(f, 0.5, { type: 'sine', vol: 0.16, delay: i * 0.25 })); }
  speak(text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.85;
      if (!this.voices.length) this.voices = window.speechSynthesis.getVoices();
      const zh = this.voices.find(v => /zh|cmn/i.test(v.lang));
      if (zh) u.voice = zh;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
}

// ============================================================================
// 2. TIỆN ÍCH
// ============================================================================
const SAVE_VERSION = 4;
const STAGE_W = 1280;
const STAGE_H = 720;
const PORTRAIT_W = 480;
const PORTRAIT_MIN_H = 900;
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pickOne = (arr) => (Array.isArray(arr) && arr.length ? arr[randInt(0, arr.length - 1)] : null);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const NUM_CHN = ['零', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十'];
const numChn = (n) => (n <= 10 ? NUM_CHN[n] : String(n));

// Biểu tượng tự vẽ (không có emoji phù hợp)
const ICON_SVG = {
  radish: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 22c12 0 16 10 12 22-3 9-9 16-12 18-3-2-9-9-12-18-4-12 0-22 12-22z" fill="#f7f7f2" stroke="#c9c9bd" stroke-width="2"/><path d="M26 34h8M30 42h6M28 50h5" stroke="#d6d6cc" stroke-width="2" stroke-linecap="round"/><path d="M32 24C28 14 20 10 16 8c6 8 10 12 14 16M32 24c2-10 8-16 14-20-4 8-8 14-12 20M32 24c0-8 0-14 2-20" stroke="#4caf50" stroke-width="5" fill="none" stroke-linecap="round"/></svg>',
  hoe: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M14 54L46 14" stroke="#a0703c" stroke-width="6" stroke-linecap="round"/><path d="M40 8l16 10-6 6-14-8z" fill="#90a4ae" stroke="#546e7a" stroke-width="2"/></svg>',
  can: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="16" y="24" width="28" height="28" rx="6" fill="#4fc3f7" stroke="#0277bd" stroke-width="3"/><path d="M44 32l14-12" stroke="#0277bd" stroke-width="5" stroke-linecap="round"/><circle cx="58" cy="19" r="4" fill="#0277bd"/><path d="M22 24c0-10 16-10 16 0" fill="none" stroke="#0277bd" stroke-width="4"/></svg>',
  sack_y: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M18 18h28l4 36c0 4-36 4-36 0z" fill="#ffe082" stroke="#b28704" stroke-width="3"/><path d="M20 18c4-8 20-8 24 0" fill="#fff3c4" stroke="#b28704" stroke-width="3"/><circle cx="32" cy="38" r="7" fill="#f9a825"/></svg>',
  sack_p: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M18 18h28l4 36c0 4-36 4-36 0z" fill="#f8bbd0" stroke="#ad1457" stroke-width="3"/><path d="M20 18c4-8 20-8 24 0" fill="#fce4ec" stroke="#ad1457" stroke-width="3"/><circle cx="32" cy="38" r="7" fill="#ec407a"/></svg>',
  sack_b: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M18 18h28l4 36c0 4-36 4-36 0z" fill="#b3e5fc" stroke="#0277bd" stroke-width="3"/><path d="M20 18c4-8 20-8 24 0" fill="#e1f5fe" stroke="#0277bd" stroke-width="3"/><path d="M24 38c6-6 12-6 16 0-4 6-10 6-16 0zM40 38l6-4v8z" fill="#29b6f6"/></svg>',
  hay: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="10" y="20" width="44" height="30" rx="6" fill="#e6c25a" stroke="#a07a18" stroke-width="3"/><path d="M14 28h36M14 36h36M14 44h36" stroke="#c9a23a" stroke-width="2"/><path d="M24 20v30M40 20v30" stroke="#8d5a1a" stroke-width="3"/></svg>',
  rice: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 16h32l3 38H13z" fill="#fff" stroke="#9e9e9e" stroke-width="3"/><text x="32" y="44" font-size="20" text-anchor="middle" fill="#d32f2f" font-family="sans-serif">米</text></svg>',
  oil: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="22" y="8" width="20" height="8" rx="2" fill="#f57f17"/><path d="M20 18h24l2 36H18z" fill="#ffd54f" stroke="#f57f17" stroke-width="3"/><text x="32" y="44" font-size="16" text-anchor="middle" fill="#bf360c" font-family="sans-serif">油</text></svg>',
  fry: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 20h44v30c0 6-44 6-44 0z" fill="#e1f5fe" stroke="#4fc3f7" stroke-width="3" opacity=".9"/><path d="M18 34c4-4 8-4 11 0-3 4-7 4-11 0zM29 34l4-3v6zM34 42c4-4 8-4 11 0-3 4-7 4-11 0zM45 42l4-3v6z" fill="#ff8a65"/></svg>',
  wool: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="24" cy="34" r="12" fill="#fafafa" stroke="#bdbdbd" stroke-width="2"/><circle cx="40" cy="30" r="13" fill="#fff" stroke="#bdbdbd" stroke-width="2"/><circle cx="34" cy="42" r="11" fill="#f5f5f5" stroke="#bdbdbd" stroke-width="2"/></svg>',
  pail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M14 22h36l-4 32H18z" fill="#cfd8dc" stroke="#607d8b" stroke-width="3"/><path d="M14 22c0-14 36-14 36 0" fill="none" stroke="#607d8b" stroke-width="3"/><path d="M18 30h28" stroke="#fff" stroke-width="4"/></svg>',
  rod: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 56L50 8" stroke="#8d6e63" stroke-width="4" stroke-linecap="round"/><path d="M50 8c6 10 6 26 2 40" fill="none" stroke="#90a4ae" stroke-width="1.5"/><circle cx="52" cy="50" r="4" fill="#e53935"/><circle cx="18" cy="46" r="5" fill="#455a64"/></svg>'
};
const iconImgCache = {};
const iconSrc = (key) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ICON_SVG[key])}`;
const iconHtml = (icon, cls = '') => (icon && icon.startsWith('svg:')
  ? `<img class="fi-svg ${cls}" src="${iconSrc(icon.slice(4))}" alt="">`
  : `<span class="fi-emo ${cls}">${icon || ''}</span>`);


// Âm thanh bổ sung: gà gáy (ngày mới) · tiếng mưa liên tục
FarmAudio.prototype.rooster = function rooster() {
  if (!this.sfxEnabled) return;
  // "ò ó o o": 3 tiếng ngắn lên giọng rồi 1 tiếng dài kéo xuống
  [[520, 760, 0, 0.16], [700, 900, 0.2, 0.16], [820, 1050, 0.4, 0.18], [1050, 560, 0.64, 0.75]].forEach(([a, b, d, len]) => {
    this.tone(a, len, { type: 'sawtooth', vol: 0.1, delay: d, slideTo: b });
    this.tone(a * 2, len, { type: 'square', vol: 0.03, delay: d, slideTo: b * 2 });
  });
};
FarmAudio.prototype.setRain = function setRain(on) {
  if (!on || !this.sfxEnabled) {
    if (this.rainNode) { try { this.rainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4); const n = this.rainNode; setTimeout(() => { try { n.stop(); } catch (e) {} }, 1500); } catch (e) {} this.rainNode = null; }
    return;
  }
  if (this.rainNode) return;
  this.init();
  if (!this.ctx) return;
  const len = this.ctx.sampleRate * 2;
  const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.002 ? 1 : 0.55);
  const src = this.ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lp = this.ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1400;
  const hp = this.ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 300;
  const g = this.ctx.createGain();
  g.gain.value = 0;
  src.connect(lp); lp.connect(hp); hp.connect(g); g.connect(this.ctx.destination);
  src.start();
  g.gain.setTargetAtTime(0.09, this.ctx.currentTime, 0.6);
  this.rainNode = src;
  this.rainGain = g;
};

// ============================================================================
// 3. DỮ LIỆU GAME (lấy từ Excel — xem XLS_* ở đầu file)
// ============================================================================
const LEVEL_MAX = 50;
const xpNeed = (L) => 30 + 10 * L;                               // EXP cần để từ cấp L lên L+1
const xpTotal = (L) => { let s = 0; for (let l = 1; l < L; l++) s += xpNeed(l); return s; };
const EXP = { hoe: 2, plant: 2, water: 1, harvest: 4, fill: 1, egg: 2, clean: 2, collect: 4, tree: 5, fruit: 4, fishfeed: 1, fish: 8, cook: 3, sell: 1, talk: 6, task: 10, clear: 1 };

// Rau củ: lịch sinh trưởng riêng (ngày tới lứa 1, số lứa, ngày chờ lứa 2, 3) — theo Excel
const VEG_ICON = { VEG01: '🌿', VEG02: '🍅', VEG03: '🥕', VEG04: '🥬', VEG05: '🥒', VEG06: '🥔', VEG07: '🥬', VEG08: '🎃', VEG09: '🌿', VEG10: '🥬', VEG11: '🍆', VEG12: '🌶️', VEG13: '🧅', VEG14: '🧄', VEG15: '🥬', VEG16: '🥬', VEG17: '🌽', VEG18: 'svg:radish', VEG19: '🥦', VEG20: '🫛' };
const VEG_Q = { VEG01: '把', VEG02: '个', VEG03: '根', VEG04: '棵', VEG05: '根', VEG06: '个', VEG07: '棵', VEG08: '个', VEG09: '把', VEG10: '棵', VEG11: '个', VEG12: '个', VEG13: '个', VEG14: '头', VEG15: '棵', VEG16: '把', VEG17: '根', VEG18: '个', VEG19: '棵', VEG20: '把' };
const CROPS = XLS_VEG.map(([code, chn, pin, vi, lvl, d1, n, w2, w3]) => {
  const waits = [d1, w2 || d1, w3 || w2 || d1].slice(0, Math.max(1, n));
  const totalDays = waits.reduce((a, b) => a + b, 0);
  const seed = 2 + Math.round(lvl / 5);
  const yieldN = 1;   // mỗi ô đất cho 1 phần (giá bán tính theo công thức nên giữ nguyên thu nhập trên mỗi hạt)
  const sell = Math.max(2, Math.round((seed * 1.6 + totalDays * 4) / (yieldN * waits.length)));
  return { id: code.toLowerCase(), code, chn, pin, vi, lvl: Math.max(1, lvl), waits, harvests: waits.length, icon: VEG_ICON[code] || '🌱', q: VEG_Q[code] || '个', seed, sell, yield: yieldN };
});
const FRUIT_ICON = { FR01: '🍎', FR02: '🍊', FR03: '🍑', FR04: '🍐', FR05: '🍇', FR06: '🍓', FR07: '🍌', FR08: '🍉', FR09: '🥭', FR10: '🍍', FR11: '🐉', FR12: '🍒' };
const FRUITS = XLS_FRUIT.map(([code, chn, pin, vi, lvl]) => {
  const grow = 3 + Math.round((lvl - 20) / 8);
  return { id: code.toLowerCase(), code, chn, pin, vi, lvl, icon: FRUIT_ICON[code] || '🍎', q: '个', sap: 30 + (lvl - 20) * 3, grow, regrow: 2 + (lvl >= 35 ? 1 : 0), yield: 3, sell: 6 + Math.round((lvl - 20) / 3) };
});
const FISH_ICON = { F01: '🐟', F04: '🐟', F05: '🐟', F06: '🐠', F09: '🦐', F10: '🦀' };
const FISH = XLS_FISH.map(([code, chn, pin, vi, lvl]) => ({ id: code.toLowerCase(), code, chn, pin, vi, lvl, icon: FISH_ICON[code] || '🐟', fry: 8 + Math.round((lvl - 20) / 2), sell: 20 + (lvl - 20), days: lvl >= 45 ? 4 : 3 }));
const POND_CAP = 10;
const BACKYARD_LVL = 20;
// Vật nuôi (tối đa 6 con / chuồng) + thú cưng trong nhà
const ANI_X = Object.fromEntries(XLS_ANI.map(r => [r[0], r]));
const mkAni = (code, extra) => { const [, chn, pin, vi, role, , lvl] = ANI_X[code]; return { chn, pin, vi, role, lvl, ...extra }; };
const ANIMALS = {
  chicken: mkAni('ANI01', { id: 'chicken', icon: '🐔', q: '只', price: 20, sell: 15, pen: { chn: '鸡舍', pin: 'jīshè', vi: 'chuồng gà', cost: 0 }, product: 'egg', cycle: 1, slots: 6 }),
  pig: mkAni('ANI02', { id: 'pig', icon: '🐷', q: '头', price: 60, sell: 50, sellGrown: 140, growDays: 4, pen: { chn: '猪舍', pin: 'zhūshè', vi: 'chuồng heo', cost: 150 }, product: null, cycle: 0, slots: 6 }),
  sheep: mkAni('ANI03', { id: 'sheep', icon: '🐑', q: '只', price: 80, sell: 60, pen: { chn: '羊舍', pin: 'yángshè', vi: 'chuồng cừu', cost: 200 }, product: 'wool', cycle: 3, slots: 6 }),
  cow: mkAni('ANI04', { id: 'cow', icon: '🐄', q: '头', price: 120, sell: 90, pen: { chn: '牛舍', pin: 'niúshè', vi: 'chuồng bò', cost: 300 }, product: 'milk', cycle: 2, slots: 6 })
};
Object.values(ANIMALS).forEach(a => { a.pen.lvl = a.lvl; a.food = 'feed'; });
const ANIMAL_IDS = ['chicken', 'pig', 'sheep', 'cow'];
const PETS = {
  dog: mkAni('ANI05', { id: 'dog', icon: '🐕', price: 200 }),
  cat: mkAni('ANI06', { id: 'cat', icon: '🐈', price: 160 })
};
const MAX_PER_PEN = 6;
// Món ăn (bếp)
const RECIPES = [
  { id: 'mifan', chn: '米饭', pin: 'mǐfàn', vi: 'cơm trắng', icon: '🍚', need: { rice: 1, water: 1 }, energy: 15 },
  { id: 'chaojidan', chn: '炒鸡蛋', pin: 'chǎo jīdàn', vi: 'trứng chiên', icon: '🍳', need: { egg: 1, oil: 1 }, energy: 20 },
  { id: 'qingcaitang', chn: '青菜汤', pin: 'qīngcài tāng', vi: 'canh rau', icon: '🥣', need: { veg: 1, water: 1 }, energy: 20 },
  { id: 'xhscjd', chn: '西红柿炒鸡蛋', pin: 'xīhóngshì chǎo jīdàn', vi: 'cà chua xào trứng', icon: '🥘', need: { veg02: 1, egg: 1 }, energy: 35 },
  { id: 'hlbtang', chn: '胡萝卜汤', pin: 'húluóbo tāng', vi: 'canh cà rốt', icon: '🍲', need: { veg03: 1, water: 1 }, energy: 25 }
];
const VEG_ANY = ['veg01', 'veg04', 'veg07', 'veg09', 'veg10', 'veg15', 'veg16'];   // các loại "rau xanh" nấu canh

// Kho đồ: id → thông tin. kind quyết định quầy bán & sức chứa
const ITEMS = {};
const addItem = (o) => { ITEMS[o.id] = o; return o; };
CROPS.forEach(c => {
  addItem({ ...c, kind: 'crop', group: 'veg' });
  addItem({ id: `seed_${c.id}`, chn: `${c.chn}种子`, pin: `${c.pin} zhǒngzi`, vi: `hạt giống ${c.vi.toLowerCase()}`, icon: c.icon, seedOf: c.id, kind: 'seed', q: '包', buy: c.seed, lvl: c.lvl, group: 'plant' });
});
FRUITS.forEach(f => {
  addItem({ ...f, kind: 'fruit', group: 'fruit' });
  addItem({ id: `sap_${f.id}`, chn: `${f.chn}树苗`, pin: `${f.pin} shùmiáo`, vi: `cây giống ${f.vi.toLowerCase()}`, icon: '🌱', sapOf: f.id, kind: 'sapling', q: '棵', buy: f.sap, lvl: f.lvl, group: 'plant' });
});
FISH.forEach(f => {
  addItem({ ...f, kind: 'fish', q: f.icon === '🦀' ? '只' : '条', group: 'fish' });
  addItem({ id: `fry_${f.id}`, chn: `${f.chn}苗`, pin: `${f.pin} miáo`, vi: `${f.vi.toLowerCase()} giống`, icon: 'svg:fry', fryOf: f.id, kind: 'fry', q: '条', buy: f.fry, lvl: f.lvl, group: 'fish' });
});
const TOOL_X = Object.fromEntries(XLS_TOOL.map(r => [r[0], r]));
const tool = (code, id, icon, buy, kind = 'tool') => { const [, chn, pin, vi, grp, lvl] = TOOL_X[code]; return { id, chn, pin, vi, grp, lvl: Math.max(1, lvl), icon, q: '个', kind, buy, group: 'tool' }; };
[
  { id: 'egg', chn: '鸡蛋', pin: 'jīdàn', vi: 'trứng gà', icon: '🥚', q: '个', kind: 'product', sell: 3, group: 'food' },
  { id: 'pork', chn: '猪肉', pin: 'zhūròu', vi: 'thịt heo', icon: '🥩', q: '块', kind: 'product', sell: 35, group: 'food' },
  { id: 'milk', chn: '牛奶', pin: 'niúnǎi', vi: 'sữa bò', icon: '🥛', q: '瓶', kind: 'product', sell: 25, group: 'food' },
  { id: 'wool', chn: '羊毛', pin: 'yángmáo', vi: 'lông cừu', icon: 'svg:wool', q: '团', kind: 'product', sell: 40, group: 'animal' },
  { ...tool('S04', 'feed', 'svg:sack_y', 1, 'feed'), q: '份' },
  { id: 'fishfood', chn: '鱼食', pin: 'yúshí', vi: 'thức ăn cho cá', icon: 'svg:sack_b', q: '份', kind: 'feed', buy: 2, lvl: BACKYARD_LVL, group: 'fish' },
  { id: 'rice', chn: '大米', pin: 'dàmǐ', vi: 'gạo', icon: 'svg:rice', q: '份', kind: 'food', buy: 2, lvl: 1, group: 'food' },
  { id: 'oil', chn: '食用油', pin: 'shíyòngyóu', vi: 'dầu ăn', icon: 'svg:oil', q: '份', kind: 'food', buy: 3, lvl: 1, group: 'food' },
  { id: 'water', chn: '水', pin: 'shuǐ', vi: 'nước', icon: '💧', q: '份', kind: 'water', group: 'life' },
  tool('T01', 'hoe', 'svg:hoe', 20),
  tool('T03', 'can', 'svg:can', 20),
  { ...tool('T05', 'fert', '🧪', 5, 'consumable'), q: '袋' },
  tool('T06', 'basket', '🧺', 60),
  tool('T10', 'gloves', '🧤', 40),
  tool('T07', 'rod', 'svg:rod', 50),
  { ...tool('T08', 'bait', '🪱', 1, 'consumable'), q: '份' }
].forEach(addItem);
RECIPES.forEach(r => addItem({ ...r, kind: 'dish', q: '份', group: 'food' }));
const DECOR_ICON = { DEC01: '🛋️', DEC02: '🫖', DEC03: '🟥', DEC04: '📚', DEC05: '🖼️', DEC06: '🕰️', DEC07: '🪟', DEC08: '💡', DEC09: '🪴', DEC10: '👟' };
const DECOR = XLS_DECOR.map(([code, grp, chn, pin, vi, price, lvl, where]) => ({ id: code.toLowerCase(), code, grp, chn, pin, vi, price, lvl, where, icon: DECOR_ICON[code] || '🎁' }));
const itemOf = (id) => ITEMS[id];
const BAG_CAP = 60;
const BASKET_BONUS = 30;       // 篮子: túi chứa thêm
const WATER_CAP = 20;
const FRIDGE_CAP = 300;
const countsInBag = (it) => it && !['tool', 'consumable', 'water'].includes(it.kind);
const SELLABLE = ['crop', 'fruit', 'fish', 'product'];

// Năng lượng tiêu hao
const ENERGY = { draw: 2, hoe: 3, plant: 1, water: 1, harvest: 2, fill: 1, clean: 2, egg: 0, collect: 2, tree: 3, fishfeed: 1, fish: 4, cook: 2, clear: 1, clearHoe: 3, fert: 1 };
const ENERGY_MAX = 100;
const WELL_DRAW = 5;

// Thời tiết
const WEATHERS = {
  sunny: { id: 'sunny', chn: '晴天', pin: 'qíngtiān', vi: 'trời nắng', icon: '☀️', note: 'Cây ngoài trời cần tưới bằng tay.' },
  cloudy: { id: 'cloudy', chn: '阴天', pin: 'yīntiān', vi: 'trời nhiều mây', icon: '⛅', note: 'Không mưa — nhớ kiểm tra và tưới cây.' },
  rain: { id: 'rain', chn: '下雨', pin: 'xiàyǔ', vi: 'trời mưa', icon: '🌧️', note: 'Mưa đã tưới hết ruộng và cây ngoài trời!' }
};
const rollWeather = () => { const r = Math.random(); return r < 0.5 ? 'sunny' : r < 0.75 ? 'cloudy' : 'rain'; };

// Vườn rau: 16 luống (4×4), mỗi luống gồm 4 Ô ĐẤT RIÊNG (cuốc, gieo, tưới, thu hoạch, vặt xác từng ô). Số luống được mua theo cấp
const BED_COLS = [7, 12, 17, 22];
const BED_ROWS = [8, 10, 12, 14];
const BED_W = 4;
const BED_POS = [];
BED_ROWS.forEach(y => BED_COLS.forEach(x => BED_POS.push([x, y])));
const PLOT_POS = [];                                   // từng ô đất: luống b có các ô b*4 … b*4+3
BED_POS.forEach(([x, y]) => { for (let c = 0; c < BED_W; c++) PLOT_POS.push([x + c, y]); });
const bedOf = (cellIdx) => Math.floor(cellIdx / BED_W);
const PLOT_PRICE = (bedIdx) => 20 + 10 * bedIdx;       // giá mua theo luống
const bedsAllowed = (L) => Math.min(BED_POS.length, 2 + Math.floor(L / 3));
const PIG_MEAT = 4;                                    // 1 heo lớn → 4 miếng 猪肉
const pigGrown = (an) => !!an && an.growth >= ANIMALS.pig.growDays;
const ORCHARD_POS = [[3, 3], [6, 3], [3, 6], [6, 6], [3, 9], [6, 9], [3, 12], [6, 12]];
const START = { money: 100, bag: { hoe: 1, can: 1, water: 5, seed_veg01: 8, feed: 6, rice: 2 } };

// Mẫu câu (Excel) & hội thoại NPC (Excel)
const SENTENCES = XLS_SENT.map(([topic, zh, pin, vi, len], i) => ({ i, topic, zh, pin, vi, len }));
const NPC_TOPIC = {
  'Chào hỏi, thăm nhà': { chn: '村民', pin: 'cūnmín', vi: 'dân làng', face: '👩', color: '#f8bbd0' },
  'Hỏi đường, tìm địa điểm': { chn: '游客', pin: 'yóukè', vi: 'du khách', face: '🧑‍🦱', color: '#bbdefb' },
  'Khách mua nông sản': { chn: '顾客', pin: 'gùkè', vi: 'khách mua hàng', face: '👩‍🦰', color: '#ffe0b2' },
  'Mua vật nuôi, hạt giống': { chn: '商人', pin: 'shāngrén', vi: 'người bán hàng', face: '🧔', color: '#d7ccc8' },
  'Thú cưng trong nhà': { chn: '邻居', pin: 'línjū', vi: 'hàng xóm', face: '👵', color: '#f0f4c3' },
  'Trò chuyện về nông trại': { chn: '农民', pin: 'nóngmín', vi: 'bác nông dân', face: '👨‍🌾', color: '#dcedc8' },
  'Khách quảng cáo, dịch vụ': { chn: '推销员', pin: 'tuīxiāoyuán', vi: 'người chào hàng', face: '🧑‍💼', color: '#d1c4e9' },
  'Tình huống bất ngờ': { chn: '朋友', pin: 'péngyou', vi: 'bạn bè', face: '🧑', color: '#b2ebf2' },
  'Ý kiến, sở thích, giao tiếp mở rộng': { chn: '朋友', pin: 'péngyou', vi: 'bạn bè', face: '👧', color: '#ffccbc' },
  'Ăn uống, sinh hoạt, mời khách': { chn: '客人', pin: 'kèrén', vi: 'khách', face: '👨', color: '#c8e6c9' }
};
const NPC_DLG = XLS_NPC.map(([topic, zh, pin, vi, choices, pins, ok], i) => ({ i, topic, zh, pin, vi, choices, pins, ok, who: NPC_TOPIC[topic] || NPC_TOPIC['Chào hỏi, thăm nhà'] }));

// Sổ tay từ vựng: 10 nhóm
const V = (chn, pin, vi) => ({ chn, pin, vi });
const VOCAB_GROUPS = [
  { id: 'plant', chn: '植物', pin: 'zhíwù', vi: 'Thực vật', words: [V('植物', 'zhíwù', 'thực vật'), V('种子', 'zhǒngzi', 'hạt giống'), V('树苗', 'shùmiáo', 'cây giống'), V('果树', 'guǒshù', 'cây ăn quả'), V('树', 'shù', 'cây'), V('草地', 'cǎodì', 'bãi cỏ'), V('花', 'huā', 'hoa'), V('菜地', 'càidì', 'luống rau'), V('菜园', 'càiyuán', 'vườn rau'), V('发芽', 'fāyá', 'nảy mầm'), V('成熟', 'chéngshú', 'chín, trưởng thành'), V('枯萎', 'kūwěi', 'héo khô')] },
  { id: 'animal', chn: '动物', pin: 'dòngwù', vi: 'Động vật', words: [V('动物', 'dòngwù', 'động vật'), ...ANIMAL_IDS.map(k => V(ANIMALS[k].chn, ANIMALS[k].pin, ANIMALS[k].vi.toLowerCase())), ...Object.values(PETS).map(p => V(p.chn, p.pin, p.vi.toLowerCase())), V('老鼠', 'lǎoshǔ', 'con chuột'), V('鸡舍', 'jīshè', 'chuồng gà'), V('猪舍', 'zhūshè', 'chuồng heo'), V('羊舍', 'yángshè', 'chuồng cừu'), V('牛舍', 'niúshè', 'chuồng bò'), V('鸡窝', 'jīwō', 'ổ gà'), V('食槽', 'shícáo', 'máng thức ăn'), V('水槽', 'shuǐcáo', 'máng nước'), V('饲料', 'sìliào', 'thức ăn chăn nuôi'), V('羊毛', 'yángmáo', 'lông cừu'), V('粪便', 'fènbiàn', 'phân'), V('健康', 'jiànkāng', 'khỏe mạnh'), V('饿', 'è', 'đói')] },
  { id: 'fruit', chn: '水果', pin: 'shuǐguǒ', vi: 'Trái cây', words: [V('水果', 'shuǐguǒ', 'trái cây'), ...FRUITS.map(f => V(f.chn, f.pin, f.vi.toLowerCase())), V('果园', 'guǒyuán', 'vườn cây ăn quả')] },
  { id: 'veg', chn: '蔬菜', pin: 'shūcài', vi: 'Rau củ', words: [V('蔬菜', 'shūcài', 'rau củ'), ...CROPS.map(c => V(c.chn, c.pin, c.vi.toLowerCase()))] },
  { id: 'fish', chn: '鱼类', pin: 'yúlèi', vi: 'Các loài cá', words: [V('鱼', 'yú', 'cá'), ...FISH.map(f => V(f.chn, f.pin, f.vi.toLowerCase())), V('鱼苗', 'yúmiáo', 'cá giống'), V('鱼塘', 'yútáng', 'ao cá'), V('鱼食', 'yúshí', 'thức ăn cho cá'), V('钓鱼', 'diàoyú', 'câu cá')] },
  { id: 'food', chn: '食物', pin: 'shíwù', vi: 'Thực phẩm', words: [V('食物', 'shíwù', 'thực phẩm'), V('鸡蛋', 'jīdàn', 'trứng gà'), V('牛奶', 'niúnǎi', 'sữa bò'), V('大米', 'dàmǐ', 'gạo'), V('食用油', 'shíyòngyóu', 'dầu ăn'), ...RECIPES.map(r => V(r.chn, r.pin, r.vi))] },
  { id: 'tool', chn: '工具', pin: 'gōngjù', vi: 'Dụng cụ', words: [V('工具', 'gōngjù', 'dụng cụ'), ...XLS_TOOL.map(r => V(r[1], r[2], r[3].toLowerCase())), V('鱼食', 'yúshí', 'thức ăn cho cá'), V('背包', 'bēibāo', 'túi đồ')] },
  { id: 'life', chn: '生活', pin: 'shēnghuó', vi: 'Sinh hoạt', words: [V('生活', 'shēnghuó', 'cuộc sống'), V('农场', 'nóngchǎng', 'nông trại'), V('房子', 'fángzi', 'ngôi nhà'), V('门', 'mén', 'cửa'), V('睡觉', 'shuìjiào', 'đi ngủ'), V('做饭', 'zuòfàn', 'nấu cơm'), V('饭桌', 'fànzhuō', 'bàn ăn'), V('吃饭', 'chīfàn', 'ăn cơm'), V('水', 'shuǐ', 'nước'), V('打水', 'dǎ shuǐ', 'múc nước'), V('浇水', 'jiāoshuǐ', 'tưới nước'), V('锄地', 'chú dì', 'cuốc đất'), V('播种', 'bōzhǒng', 'gieo hạt'), V('收获', 'shōuhuò', 'thu hoạch'), V('施肥', 'shīféi', 'bón phân'), V('喂', 'wèi', 'cho ăn'), V('加水', 'jiā shuǐ', 'thêm nước'), V('捡鸡蛋', 'jiǎn jīdàn', 'nhặt trứng'), V('打扫', 'dǎsǎo', 'quét dọn'), V('体力', 'tǐlì', 'thể lực, năng lượng'), V('累', 'lèi', 'mệt'), V('等级', 'děngjí', 'cấp độ'), V('经验', 'jīngyàn', 'kinh nghiệm (EXP)'), V('升级', 'shēngjí', 'lên cấp'), V('任务', 'rènwu', 'nhiệm vụ'), V('明天', 'míngtiān', 'ngày mai'), V('天气', 'tiānqì', 'thời tiết'), ...Object.values(WEATHERS).map(w => V(w.chn, w.pin, w.vi)), V('天', 'tiān', 'ngày'), V('后院', 'hòuyuàn', 'vườn sau nhà'), V('小路', 'xiǎolù', 'đường mòn'), ...DECOR.map(d => V(d.chn, d.pin, d.vi.toLowerCase()))] },
  { id: 'trade', chn: '买卖', pin: 'mǎimai', vi: 'Mua bán', words: [V('买卖', 'mǎimai', 'mua bán'), V('商店', 'shāngdiàn', 'cửa hàng'), V('买', 'mǎi', 'mua'), V('卖', 'mài', 'bán'), V('钱', 'qián', 'tiền'), V('元', 'yuán', 'đồng (tệ)'), V('多少钱', 'duōshao qián', 'bao nhiêu tiền'), V('一共', 'yígòng', 'tổng cộng'), V('便宜', 'piányi', 'rẻ'), V('贵', 'guì', 'đắt'), V('收购', 'shōugòu', 'thu mua'), V('老板', 'lǎobǎn', 'ông chủ'), V('顾客', 'gùkè', 'khách hàng'), V('商人', 'shāngrén', 'người buôn bán'), V('装饰', 'zhuāngshì', 'đồ trang trí'), V('欢迎光临', 'huānyíng guānglín', 'chào mừng quý khách')] },
  { id: 'social', chn: '交际', pin: 'jiāojì', vi: 'Giao tiếp', words: [V('交际', 'jiāojì', 'giao tiếp'), V('你好', 'nǐ hǎo', 'xin chào'), V('谢谢', 'xièxie', 'cảm ơn'), V('不客气', 'bú kèqi', 'không có gì'), V('不好意思', 'bù hǎoyìsi', 'xin lỗi, ngại quá'), V('再见', 'zàijiàn', 'tạm biệt'), V('欢迎', 'huānyíng', 'hoan nghênh'), V('请问', 'qǐngwèn', 'xin hỏi'), V('没问题', 'méi wèntí', 'không vấn đề gì'), ...[...new Map(Object.values(NPC_TOPIC).map(n => [n.chn, V(n.chn, n.pin, n.vi)])).values()]] }
];
const VOCAB_INDEX = {};
VOCAB_GROUPS.forEach(g => g.words.forEach(w => { if (!VOCAB_INDEX[w.chn]) VOCAB_INDEX[w.chn] = { ...w, group: g.id }; }));
const VOCAB_TOTAL = Object.keys(VOCAB_INDEX).length;
const wordOf = (chn) => VOCAB_INDEX[chn] || (Object.values(ITEMS).find(i => i.chn === chn)) || null;

// Mở khóa theo cấp (để hiện khi lên cấp & trong bản đồ)
function unlocksAt(L) {
  const out = [];
  CROPS.filter(c => c.lvl === L).forEach(c => out.push(`${c.chn} ${c.vi}`));
  FRUITS.filter(f => f.lvl === L).forEach(f => out.push(`${f.chn}树苗 cây giống ${f.vi.toLowerCase()}`));
  FISH.filter(f => f.lvl === L).forEach(f => out.push(`${f.chn}苗 ${f.vi.toLowerCase()} giống`));
  ANIMAL_IDS.filter(k => ANIMALS[k].lvl === L && L > 1).forEach(k => out.push(`${ANIMALS[k].pen.chn} ${ANIMALS[k].pen.vi} (mua chuồng) · ${ANIMALS[k].chn} ${ANIMALS[k].vi.toLowerCase()}`));
  Object.values(PETS).filter(p => p.lvl === L).forEach(p => out.push(`${p.chn} ${p.vi.toLowerCase()} (thú cưng)`));
  Object.values(ITEMS).filter(i => (i.kind === 'tool' || i.kind === 'consumable') && !['basket', 'gloves'].includes(i.id) && i.lvl === L && L > 1).forEach(i => out.push(`${i.chn} ${i.vi.toLowerCase()}`));
  DECOR.filter(d => d.lvl === L).forEach(d => out.push(`${d.chn} ${d.vi.toLowerCase()} (trang trí)`));
  if (L === BACKYARD_LVL) out.push('后院 vườn sau nhà: vườn cây ăn quả & ao cá');
  if (bedsAllowed(L) > bedsAllowed(L - 1)) out.push(`菜地 thêm 1 luống rau được mua (${bedsAllowed(L)} luống)`);
  return out;
}


// ============================================================================
// 4. BẢN ĐỒ (lưới ô vuông) & TÌM ĐƯỜNG A*
// ============================================================================
// Mã ô nền: g cỏ · p đường · t cây (chặn) · b bụi (chặn) · f sàn gỗ · w tường (chặn) · d sàn chuồng · W nước (chặn) · x hoa · F hàng rào (chặn) · s đất vườn
const SCENES = {
  farm: { cols: 31, rows: 18, chn: '农场', pin: 'nóngchǎng', vi: 'Nông trại', icon: '🏡' },
  house: { cols: 12, rows: 8, chn: '房子', pin: 'fángzi', vi: 'Trong nhà', icon: '🛏️' },
  pen_chicken: { cols: 13, rows: 9, chn: '鸡舍', pin: 'jīshè', vi: 'Chuồng gà', icon: '🐔', animal: 'chicken' },
  pen_pig: { cols: 13, rows: 9, chn: '猪舍', pin: 'zhūshè', vi: 'Chuồng heo', icon: '🐷', animal: 'pig' },
  pen_sheep: { cols: 13, rows: 9, chn: '羊舍', pin: 'yángshè', vi: 'Chuồng cừu', icon: '🐑', animal: 'sheep' },
  pen_cow: { cols: 13, rows: 9, chn: '牛舍', pin: 'niúshè', vi: 'Chuồng bò', icon: '🐄', animal: 'cow' },
  forest: { cols: 24, rows: 14, chn: '后院', pin: 'hòuyuàn', vi: 'Vườn sau nhà', icon: '🌳' }
};
const PEN_X = { chicken: 7, pig: 11, sheep: 15, cow: 19 };   // chuồng 4×3 ô ở hàng y = 1..3
const PEN_DOOR = (a) => [PEN_X[a] + 2, 4];
const GARDEN = { x0: 6, y0: 7, x1: 26, y1: 15 };
const WELL = [3, 6];                                    // giếng ở phía trên, ngay dưới nhà: sáng dậy múc nước là tưới rau / cho vật nuôi uống
const POND = { x0: 15, y0: 4, x1: 21, y1: 10 };
const FEEDER = [14, 3];
const ANIMAL_SPOTS = [[3, 2], [6, 2], [9, 2], [3, 5], [6, 5], [9, 5]];
const DECOR_POS = { dec01: [8, 4, 2], dec02: [8, 5, 1], dec03: [3, 5, 2], dec04: [10, 1, 1], dec05: [3, 0, 1], dec06: [9, 0, 1], dec07: [2, 0, 1], dec08: [3, 1, 1], dec09: [10, 6, 1], dec10: [7, 6, 1] };

const grid = (cols, rows, ch) => Array.from({ length: rows }, () => Array(cols).fill(ch));
const seeded = (x, y) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); };

function buildScene(g, id) {
  const meta = SCENES[id];
  const { cols, rows } = meta;
  const base = grid(cols, rows, 'g');
  const objs = [];
  const add = (o) => { objs.push({ w: 1, h: 1, ...o }); return o; };

  if (id === 'farm') {
    for (let x = 0; x < cols; x++) { base[0][x] = 't'; base[rows - 1][x] = 't'; }
    for (let y = 0; y < rows; y++) { base[y][0] = 't'; base[y][cols - 1] = 't'; }
    for (let x = 6; x <= 24; x++) base[4][x] = 'p';
    for (let x = 1; x <= 29; x++) { base[5][x] = 'p'; base[16][x] = 'p'; }
    for (let y = 5; y <= 16; y++) { base[y][1] = 'p'; base[y][2] = 'p'; base[y][27] = 'p'; }
    base[15][0] = 'p';                                   // lối ra vườn sau (góc dưới trái)
    // vườn rau có rào
    for (let y = GARDEN.y0; y <= GARDEN.y1; y++) for (let x = GARDEN.x0; x <= GARDEN.x1; x++) {
      const edge = y === GARDEN.y0 || y === GARDEN.y1 || x === GARDEN.x0 || x === GARDEN.x1;
      const gap = ((y === GARDEN.y0 || y === GARDEN.y1) && [11, 16, 21].includes(x)) || ((x === GARDEN.x0 || x === GARDEN.x1) && [9, 11, 13].includes(y));
      base[y][x] = edge && !gap ? 'F' : 's';
    }
    // hoa, bụi trang trí ở bãi cỏ trống
    [[5, 8, 'x'], [3, 12, 'x'], [4, 14, 'x'], [5, 10, 'b'], [5, 6, 'x'], [28, 13, 'x'], [29, 14, 'x'], [28, 6, 'b'], [24, 6, 'x'], [9, 6, 'x'], [19, 6, 'x'], [14, 6, 'b']].forEach(([x, y, c]) => { base[y][x] = c; });
    add({ id: 'house', kind: 'house', x: 1, y: 1, w: 5, h: 4, word: '房子', stand: [[3, 5]] });
    ANIMAL_IDS.forEach(a => add({ id: `pen_${a}`, kind: 'pen', animal: a, x: PEN_X[a], y: 1, w: 4, h: 3, word: ANIMALS[a].pen.chn, stand: [PEN_DOOR(a)] }));
    add({ id: 'shop', kind: 'shop', x: 25, y: 1, w: 5, h: 4, word: '商店', stand: [[27, 5]] });
    PLOT_POS.forEach(([x, y], i) => add({ id: `plot${i}`, kind: 'plot', idx: i, x, y, w: 1, h: 1, word: '菜地' }));
    add({ id: 'well', kind: 'well', x: WELL[0], y: WELL[1], w: 2, h: 2, word: '水井', stand: [[WELL[0], WELL[1] - 1], [WELL[0] + 1, WELL[1] - 1]] });
    add({ id: 'exit_forest', kind: 'exit', to: 'forest', x: 0, y: 15, w: 1, h: 1, word: '后院', stand: [[1, 15]] });
    if (g.npc && !g.npc.done) add({ id: 'npc', kind: 'npc', x: 3, y: 11, word: g.npcWho().chn });
  } else if (id === 'house') {
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) base[y][x] = (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) ? 'w' : 'f';
    base[rows - 1][6] = 'f';
    add({ id: 'bed', kind: 'bed', x: 1, y: 1, w: 2, h: 2, word: '床' });
    add({ id: 'stove', kind: 'stove', x: 5, y: 1, word: '厨房' });
    add({ id: 'fridge', kind: 'fridge', x: 7, y: 1, word: '冰箱' });
    add({ id: 'table', kind: 'table', x: 5, y: 4, w: 2, h: 1, word: '饭桌' });
    (g.decor || []).forEach(k => {
      const d = DECOR.find(x => x.id === k);
      const p = DECOR_POS[k];
      if (!d || !p) return;
      const wall = p[1] === 0;
      add({ id: `decor_${k}`, kind: 'decor', decor: k, x: p[0], y: p[1], w: p[2], h: 1, walk: wall || k === 'dec03', word: d.chn });
    });
    add({ id: 'door_out', kind: 'exit', to: 'farm', x: 6, y: rows - 1, word: '门', stand: [[6, rows - 2]] });
  } else if (id.startsWith('pen_')) {
    const a = ANIMALS[meta.animal];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) base[y][x] = (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) ? 'w' : 'd';
    base[rows - 1][6] = 'd';
    const pen = g.pens[a.id];
    [2, 3, 4, 5, 6, 7].forEach((y, i) => {
      add({ id: `food${i}`, kind: 'tray', tray: 'food', slot: i, x: 1, y, word: '食槽', stand: [[2, y]] });
      add({ id: `water${i}`, kind: 'tray', tray: 'water', slot: i, x: cols - 2, y, word: '水槽', stand: [[cols - 3, y]] });
    });
    if (a.id === 'chicken') {
      for (let i = 0; i < 6; i++) add({ id: `nest${i}`, kind: 'nest', slot: i, x: 3 + i, y: 1, word: '鸡窝', stand: [[3 + i, 2]] });
    } else {
      pen.animals.forEach((an, i) => add({ id: `animal${i}`, kind: 'animal', slot: i, x: ANIMAL_SPOTS[i][0], y: ANIMAL_SPOTS[i][1], word: a.chn }));
    }
    (pen.poops || []).forEach(([x, y], i) => add({ id: `poop${i}`, kind: 'poop', idx: i, x, y, walk: true, word: '粪便' }));
    add({ id: 'door_out', kind: 'exit', to: 'farm', x: 6, y: rows - 1, word: '门', stand: [[6, rows - 2]] });
  } else if (id === 'forest') {
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) base[y][x] = 't';
      else if (seeded(x + 3, y + 7) < 0.1 && (x < 9 || x > 13) && !(x >= POND.x0 - 1 && x <= POND.x1 + 1 && y >= POND.y0 - 1 && y <= POND.y1 + 1) && !(x >= 2 && x <= 7 && y >= 2)) base[y][x] = 't';
    }
    for (let y = 0; y < rows - 1; y++) { base[y][11] = 'p'; base[y][12] = 'p'; }
    for (let y = POND.y0; y <= POND.y1; y++) for (let x = POND.x0; x <= POND.x1; x++) base[y][x] = 'W';
    [[POND.x0, POND.y0], [POND.x1, POND.y0], [POND.x0, POND.y1], [POND.x1, POND.y1]].forEach(([x, y]) => { base[y][x] = 'g'; });
    for (let x = 2; x <= 8; x++) if (base[1][x] === 'g') base[1][x] = 'x';
    add({ id: 'exit_farm', kind: 'exit', to: 'farm', x: 11, y: 0, w: 2, h: 1, word: '农场', stand: [[11, 1], [12, 1]] });
    ORCHARD_POS.forEach(([x, y], i) => add({ id: `tree${i}`, kind: 'tree', idx: i, x, y, word: '果树' }));
    add({ id: 'feeder', kind: 'feeder', x: FEEDER[0], y: FEEDER[1], word: '鱼塘' });
    add({ id: 'pond', kind: 'pond', x: POND.x0, y: POND.y0, w: POND.x1 - POND.x0 + 1, h: POND.y1 - POND.y0 + 1, word: '鱼塘', isPond: true });
  }

  const block = base.map(row => row.map(ch => ['t', 'b', 'w', 'W', 'F'].includes(ch)));
  objs.forEach(o => {
    if (o.walk || o.isPond) return;
    for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) if (block[y]) block[y][x] = true;
  });
  return { id, cols, rows, base, block, objs, meta };
}

const objAt = (sc, x, y) => {
  const hits = sc.objs.filter(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
  if (!hits.length) return null;
  return hits.sort((a, b) => (a.w * a.h) - (b.w * b.h))[0];
};

function standTiles(sc, o) {
  const ok = ([x, y]) => x >= 0 && y >= 0 && x < sc.cols && y < sc.rows && !sc.block[y][x];
  if (o.stand) return o.stand.filter(ok);
  if (o.walk) return [[o.x, o.y], [o.x + 1, o.y], [o.x - 1, o.y], [o.x, o.y + 1], [o.x, o.y - 1]].filter(ok);
  const out = [];
  for (let y = o.y - 1; y <= o.y + o.h; y++) for (let x = o.x - 1; x <= o.x + o.w; x++) {
    const inside = x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h;
    const diag = (x < o.x || x >= o.x + o.w) && (y < o.y || y >= o.y + o.h);
    if (inside || diag) continue;
    if (o.isPond) { const nx = clamp(x, o.x, o.x + o.w - 1); const ny = clamp(y, o.y, o.y + o.h - 1); if (sc.base[ny][nx] !== 'W') continue; }
    if (ok([x, y])) out.push([x, y]);
  }
  return out;
}

function findPath(sc, from, goals) {
  const key = (x, y) => y * sc.cols + x;
  const goalSet = new Set(goals.map(([x, y]) => key(x, y)));
  if (!goalSet.size) return null;
  const sk = key(from[0], from[1]);
  if (goalSet.has(sk)) return [];
  const h = (x, y) => Math.min(...goals.map(([gx, gy]) => Math.abs(gx - x) + Math.abs(gy - y)));
  const open = [{ x: from[0], y: from[1], g: 0, f: h(from[0], from[1]) }];
  const came = new Map();
  const gScore = new Map([[sk, 0]]);
  const closed = new Set();
  let guard = 0;
  while (open.length && guard++ < 8000) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
    const cur = open.splice(bi, 1)[0];
    const ck = key(cur.x, cur.y);
    if (closed.has(ck)) continue;
    closed.add(ck);
    if (goalSet.has(ck)) {
      const path = [];
      let k = ck;
      while (k !== sk) { path.unshift([k % sc.cols, Math.floor(k / sc.cols)]); k = came.get(k); }
      return path;
    }
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || ny < 0 || nx >= sc.cols || ny >= sc.rows || sc.block[ny][nx]) return;
      const nk = key(nx, ny);
      const ng = cur.g + 1;
      if (ng < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, ng);
        came.set(nk, ck);
        open.push({ x: nx, y: ny, g: ng, f: ng + h(nx, ny) });
      }
    });
  }
  return null;
}


// ============================================================================
// 5. VẼ BẢN ĐỒ (canvas 2D, phong cách hoạt hình đơn giản)
// ============================================================================
const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
const MIN_TILE = 34;

function drawIcon(ctx, icon, cx, cy, size) {
  if (!icon) return;
  if (icon.startsWith('svg:')) {
    const k = icon.slice(4);
    let img = iconImgCache[k];
    if (!img) { img = new Image(); img.src = iconSrc(k); iconImgCache[k] = img; }
    if (img.complete && img.naturalWidth) ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
    return;
  }
  ctx.font = `${Math.round(size)}px ${EMOJI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, cx, cy + size * 0.06);
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function label(ctx, text, cx, y, T, bg = 'rgba(255,253,245,0.92)', fg = '#4a2c12') {
  ctx.font = `700 ${Math.max(10, Math.round(T * 0.3))}px "LXGW WenKai Lite","Be Vietnam Pro",sans-serif`;
  const w = ctx.measureText(text).width + T * 0.24;
  const h = T * 0.4;
  rr(ctx, cx - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, y + 1);
}
function sparkle(ctx, cx, cy, T, t) {
  for (let i = 0; i < 3; i++) {
    const a = t / 400 + i * 2.1;
    const x = cx + Math.cos(a) * T * 0.32;
    const y = cy + Math.sin(a * 1.3) * T * 0.22 - T * 0.1;
    const s = T * (0.06 + 0.04 * Math.sin(t / 150 + i));
    ctx.fillStyle = i % 2 ? '#fff59d' : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x, y - s * 2); ctx.lineTo(x + s * 0.6, y - s * 0.6); ctx.lineTo(x + s * 2, y); ctx.lineTo(x + s * 0.6, y + s * 0.6);
    ctx.lineTo(x, y + s * 2); ctx.lineTo(x - s * 0.6, y + s * 0.6); ctx.lineTo(x - s * 2, y); ctx.lineTo(x - s * 0.6, y - s * 0.6);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTile(ctx, ch, tx, ty, X, Y, T, t, sceneId) {
  const v = seeded(tx, ty);
  const grassA = sceneId === 'forest' ? '#7cbf5a' : '#8fd16a';
  const grassB = sceneId === 'forest' ? '#74b552' : '#86c962';
  if (['g', 't', 'b', 'x'].includes(ch)) {
    ctx.fillStyle = (tx + ty) % 2 ? grassA : grassB;
    ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    if (v < 0.35 && ch === 'g') { ctx.strokeStyle = 'rgba(40,110,30,0.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); const gx = X + v * T * 2; const gy = Y + T * 0.7; ctx.moveTo(gx, gy); ctx.lineTo(gx - 2, gy - 6); ctx.moveTo(gx + 3, gy); ctx.lineTo(gx + 4, gy - 7); ctx.stroke(); }
  }
  if (ch === 'p') {
    ctx.fillStyle = '#e6c793'; ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    ctx.fillStyle = 'rgba(160,120,70,0.35)';
    ctx.beginPath(); ctx.arc(X + T * (0.2 + v * 0.6), Y + T * (0.3 + v * 0.4), T * 0.05, 0, 7); ctx.fill();
  } else if (ch === 't') {
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(X + T / 2, Y + T * 0.85, T * 0.38, T * 0.12, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#7b4f2c'; ctx.fillRect(X + T * 0.43, Y + T * 0.55, T * 0.14, T * 0.32);
    ctx.fillStyle = v < 0.5 ? '#2e7d32' : '#388e3c';
    ctx.beginPath(); ctx.arc(X + T / 2, Y + T * 0.38, T * 0.38, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(X + T * 0.4, Y + T * 0.28, T * 0.15, 0, 7); ctx.fill();
  } else if (ch === 'b') {
    ctx.fillStyle = '#43a047';
    [[0.3, 0.6, 0.22], [0.62, 0.58, 0.24], [0.47, 0.42, 0.24]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(X + T * a, Y + T * b, T * r, 0, 7); ctx.fill(); });
    ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(X + T * 0.6, Y + T * 0.45, T * 0.05, 0, 7); ctx.fill();
  } else if (ch === 'x') {
    const cols = ['#ff8fb1', '#fff176', '#ffffff', '#ce93d8'];
    for (let i = 0; i < 3; i++) { ctx.fillStyle = cols[(i + Math.floor(v * 4)) % 4]; ctx.beginPath(); ctx.arc(X + T * (0.2 + ((v * 7 + i * 0.3) % 0.6)), Y + T * (0.25 + ((v * 5 + i * 0.27) % 0.55)), T * 0.07, 0, 7); ctx.fill(); }
  } else if (ch === 'f') {
    ctx.fillStyle = ty % 2 ? '#d9a86a' : '#d19e60'; ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    ctx.strokeStyle = 'rgba(120,70,30,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X, Y + T - 0.5); ctx.lineTo(X + T, Y + T - 0.5); ctx.moveTo(X + ((tx + ty) % 3) * T / 3, Y); ctx.lineTo(X + ((tx + ty) % 3) * T / 3, Y + T); ctx.stroke();
  } else if (ch === 'w') {
    ctx.fillStyle = '#8d6e63'; ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    ctx.fillStyle = '#a1887f'; ctx.fillRect(X, Y, T + 0.5, T * 0.25);
    ctx.strokeStyle = 'rgba(60,30,10,0.25)'; ctx.strokeRect(X + 0.5, Y + 0.5, T - 1, T - 1);
  } else if (ch === 'd') {
    ctx.fillStyle = (tx + ty) % 2 ? '#ead59c' : '#e3cc8f'; ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    ctx.strokeStyle = 'rgba(170,130,50,0.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X + T * v, Y + T * 0.3); ctx.lineTo(X + T * v + 6, Y + T * 0.36); ctx.moveTo(X + T * (1 - v), Y + T * 0.7); ctx.lineTo(X + T * (1 - v) - 6, Y + T * 0.76); ctx.stroke();
  } else if (ch === 'W') {
    ctx.fillStyle = '#4fb3e8'; ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath();
    const o = Math.sin(t / 700 + tx + ty) * T * 0.08;
    ctx.moveTo(X + T * 0.15 + o, Y + T * 0.4); ctx.quadraticCurveTo(X + T * 0.3 + o, Y + T * 0.32, X + T * 0.45 + o, Y + T * 0.4);
    ctx.stroke();
  }
}

function drawPlayer(ctx, cx, cy, T, face, walking, t) {
  const s = T / 40;
  const bob = walking ? Math.sin(t / 70) * 1.6 * s : 0;
  const leg = walking ? Math.sin(t / 70) * 4 * s : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(cx, cy + 15 * s, 11 * s, 4 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#5d4037';
  if (face === 'left' || face === 'right') { ctx.fillRect(cx - 3 * s + leg, cy + 6 * s, 5 * s, 9 * s); ctx.fillRect(cx - 2 * s - leg, cy + 6 * s, 5 * s, 9 * s); } else { ctx.fillRect(cx - 6 * s, cy + 6 * s + Math.max(0, leg), 5 * s, 9 * s - Math.max(0, leg)); ctx.fillRect(cx + 1 * s, cy + 6 * s + Math.max(0, -leg), 5 * s, 9 * s - Math.max(0, -leg)); }
  const by = cy + bob;
  ctx.fillStyle = '#e53935'; rr(ctx, cx - 9 * s, by - 4 * s, 18 * s, 13 * s, 4 * s); ctx.fill();            // áo
  ctx.fillStyle = '#1e88e5'; rr(ctx, cx - 8 * s, by + 1 * s, 16 * s, 9 * s, 3 * s); ctx.fill();              // yếm
  ctx.fillStyle = '#ffd7b5'; ctx.beginPath(); ctx.arc(cx, by - 11 * s, 9 * s, 0, 7); ctx.fill();            // đầu
  ctx.fillStyle = '#3e2723';
  if (face === 'up') { ctx.beginPath(); ctx.arc(cx, by - 12 * s, 9 * s, 0, 7); ctx.fill(); }
  else if (face === 'down') { ctx.fillRect(cx - 4 * s, by - 12 * s, 2.2 * s, 3 * s); ctx.fillRect(cx + 2 * s, by - 12 * s, 2.2 * s, 3 * s); ctx.fillStyle = '#ef9a9a'; ctx.beginPath(); ctx.arc(cx - 5.5 * s, by - 8 * s, 1.8 * s, 0, 7); ctx.arc(cx + 5.5 * s, by - 8 * s, 1.8 * s, 0, 7); ctx.fill(); }
  else { const d = face === 'left' ? -1 : 1; ctx.fillRect(cx + d * 4 * s - 1 * s, by - 12 * s, 2.2 * s, 3 * s); }
  ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.ellipse(cx, by - 16 * s, 14 * s, 4.5 * s, 0, 0, 7); ctx.fill();   // nón rơm
  ctx.fillStyle = '#e0ac2c'; ctx.beginPath(); ctx.ellipse(cx, by - 19 * s, 8 * s, 5 * s, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#d84315'; ctx.fillRect(cx - 8 * s, by - 18 * s, 16 * s, 2 * s);
}



// Ô hàng rào & đất trong vườn
function drawTile2(ctx, ch, tx, ty, X, Y, T, t, sceneId) {
  if (ch === 's' || ch === 'F') {
    ctx.fillStyle = (tx + ty) % 2 ? '#a8d878' : '#9fd170';
    ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    if (ch === 'F') {
      ctx.fillStyle = '#b5773e';
      const horiz = ty === GARDEN.y0 || ty === GARDEN.y1;
      if (horiz) { ctx.fillRect(X, Y + T * 0.35, T + 0.5, T * 0.1); ctx.fillRect(X, Y + T * 0.6, T + 0.5, T * 0.1); }
      else { ctx.fillRect(X + T * 0.35, Y, T * 0.1, T + 0.5); ctx.fillRect(X + T * 0.6, Y, T * 0.1, T + 0.5); }
      ctx.fillStyle = '#8a5528';
      rr(ctx, X + T * 0.4, Y + T * 0.2, T * 0.2, T * 0.62, 3); ctx.fill();
      ctx.fillStyle = '#d39a5d'; ctx.fillRect(X + T * 0.4, Y + T * 0.2, T * 0.2, T * 0.08);
    }
    return;
  }
  drawTile(ctx, ch, tx, ty, X, Y, T, t, sceneId);
}

function board(ctx, cx, cy, T, zh, vi, bg = '#fff8e8') {
  ctx.font = `700 ${Math.round(T * 0.42)}px "LXGW WenKai Lite",sans-serif`;
  const w1 = ctx.measureText(zh).width;
  ctx.font = `700 ${Math.round(T * 0.24)}px "Be Vietnam Pro",sans-serif`;
  const w2 = vi ? ctx.measureText(vi).width : 0;
  const w = Math.max(w1, w2) + T * 0.5;
  const h = vi ? T * 0.86 : T * 0.6;
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; rr(ctx, cx - w / 2 + 2, cy - h / 2 + 3, w, h, h * 0.35); ctx.fill();
  ctx.fillStyle = bg; rr(ctx, cx - w / 2, cy - h / 2, w, h, h * 0.35); ctx.fill();
  ctx.strokeStyle = '#a8743f'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#4a2c12'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(T * 0.42)}px "LXGW WenKai Lite",sans-serif`;
  ctx.fillText(zh, cx, vi ? cy - h * 0.18 : cy + 1);
  if (vi) { ctx.font = `700 ${Math.round(T * 0.24)}px "Be Vietnam Pro",sans-serif`; ctx.fillStyle = '#6b4a2a'; ctx.fillText(vi, cx, cy + h * 0.26); }
}
function roof(ctx, X, Y, W, H, c1, c2) {
  ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(X - 4, Y + H); ctx.lineTo(X + W * 0.14, Y); ctx.lineTo(X + W * 0.86, Y); ctx.lineTo(X + W + 4, Y + H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c2; ctx.fillRect(X - 4, Y + H - 5, W + 8, 6);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
  for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(X + W * 0.14 + (i * W * 0.72) / 5, Y + 2); ctx.lineTo(X + (i * W) / 5, Y + H - 6); ctx.stroke(); }
}

function drawObj(ctx, g, sc, o, X, Y, T, t) {
  const W = o.w * T;
  const H = o.h * T;
  const cx = X + W / 2;
  const cy = Y + H / 2;
  switch (o.kind) {
    case 'house': {
      ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(X + 8, Y + H - 6, W - 6, 8);
      ctx.fillStyle = '#fbf0dc'; ctx.fillRect(X + T * 0.3, Y + T * 1.4, W - T * 0.6, H - T * 1.75);
      ctx.strokeStyle = '#c49a6c'; ctx.lineWidth = 2; ctx.strokeRect(X + T * 0.3, Y + T * 1.4, W - T * 0.6, H - T * 1.75);
      roof(ctx, X, Y + T * 0.25, W, T * 1.25, '#d23c32', '#a82c24');
      ctx.fillStyle = '#7b4f2c'; ctx.fillRect(X + W * 0.74, Y + T * 0.05, T * 0.36, T * 0.7);
      [[0.6, 1.75], [1.4, 1.75], [3.1, 1.75], [3.9, 1.75]].forEach(([a, b]) => { ctx.fillStyle = g.weather === 'rain' ? '#ffe08a' : '#8fd3ff'; ctx.fillRect(X + T * a, Y + T * b, T * 0.55, T * 0.55); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(X + T * a, Y + T * b, T * 0.55, T * 0.55); ctx.beginPath(); ctx.moveTo(X + T * (a + 0.275), Y + T * b); ctx.lineTo(X + T * (a + 0.275), Y + T * (b + 0.55)); ctx.stroke(); });
      ctx.fillStyle = '#8b5a2b'; rr(ctx, X + T * 2.15, Y + T * 2.3, T * 0.7, T * 1.05, 5); ctx.fill();
      ctx.fillStyle = '#ffd54f'; ctx.beginPath(); ctx.arc(X + T * 2.72, Y + T * 2.85, T * 0.05, 0, 7); ctx.fill();
      ctx.fillStyle = '#d7c3a5'; ctx.fillRect(X + T * 1.8, Y + T * 3.35, T * 1.4, T * 0.22); ctx.fillStyle = '#c4ab88'; ctx.fillRect(X + T * 1.65, Y + T * 3.55, T * 1.7, T * 0.22);
      [[0.4, 3.2], [3.5, 3.2]].forEach(([a, b]) => { ctx.fillStyle = '#a0693a'; ctx.fillRect(X + T * a, Y + T * b, T * 1.1, T * 0.42); drawIcon(ctx, '🌼', X + T * (a + 0.3), Y + T * (b - 0.02), T * 0.34); drawIcon(ctx, '🌸', X + T * (a + 0.78), Y + T * (b - 0.02), T * 0.34); });
      [[1.45, 2.6], [3.4, 2.6]].forEach(([a, b]) => { ctx.fillStyle = '#3e2723'; ctx.fillRect(X + T * a, Y + T * b, T * 0.08, T * 1.1); ctx.fillStyle = g.weather === 'rain' ? '#ffe082' : '#fff3c4'; ctx.beginPath(); ctx.arc(X + T * (a + 0.04), Y + T * b, T * 0.13, 0, 7); ctx.fill(); });
      board(ctx, cx, Y + T * 1.05, T, '我的家', '');
      break;
    }
    case 'pen': drawPen(ctx, g, o, X, Y, T, t); break;
    case 'shop': {
      ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(X + 8, Y + H - 6, W - 6, 8);
      ctx.fillStyle = '#b07a46'; ctx.fillRect(X + T * 0.25, Y + T * 1.5, W - T * 0.5, H - T * 1.75);
      ctx.fillStyle = '#c98f55'; for (let i = 0; i < 6; i++) ctx.fillRect(X + T * 0.25, Y + T * (1.6 + i * 0.36), W - T * 0.5, 2);
      for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? '#fff6ea' : '#e53935'; ctx.beginPath(); const x0 = X + (i * W) / 10; ctx.moveTo(x0, Y + T * 0.85); ctx.lineTo(x0 + W / 10, Y + T * 0.85); ctx.lineTo(x0 + W / 10, Y + T * 1.45); ctx.arc(x0 + W / 20, Y + T * 1.45, W / 20, 0, Math.PI); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#8fd3ff'; ctx.fillRect(X + T * 2.9, Y + T * 2.0, T * 1.3, T * 0.8); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(X + T * 2.9, Y + T * 2.0, T * 1.3, T * 0.8);
      ctx.fillStyle = '#6d4c41'; rr(ctx, X + T * 1.7, Y + T * 2.3, T * 0.8, T * 1.45, 4); ctx.fill();
      [[0.55, 3.35, '🥕'], [1.2, 3.35, '🍅'], [3.1, 3.35, '🥬'], [3.8, 3.35, '🌽']].forEach(([a, b, e]) => { ctx.fillStyle = '#d8a35f'; ctx.fillRect(X + T * a - T * 0.3, Y + T * b - T * 0.1, T * 0.6, T * 0.45); drawIcon(ctx, e, X + T * a, Y + T * b, T * 0.36); });
      drawIcon(ctx, '🏮', X + T * 0.3, Y + T * 1.9, T * 0.42); drawIcon(ctx, '🏮', X + W - T * 0.3, Y + T * 1.9, T * 0.42);
      board(ctx, cx, Y + T * 0.42, T, '商店', 'Cửa hàng');
      break;
    }
    case 'plot': drawBed(ctx, g, o, X, Y, T, t); break;
    case 'well': {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(cx, Y + H - 6, W * 0.42, 8, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#9e9e9e'; rr(ctx, X + W * 0.12, Y + H * 0.42, W * 0.76, H * 0.48, 10); ctx.fill();
      ctx.strokeStyle = '#757575'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(X + W * 0.12, Y + H * (0.55 + i * 0.12)); ctx.lineTo(X + W * 0.88, Y + H * (0.55 + i * 0.12)); ctx.stroke(); }
      ctx.fillStyle = '#29b6f6'; ctx.beginPath(); ctx.ellipse(cx, Y + H * 0.44, W * 0.3, H * 0.08, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#6d4c41'; ctx.fillRect(X + W * 0.16, Y + H * 0.1, T * 0.12, H * 0.38); ctx.fillRect(X + W * 0.84 - T * 0.12, Y + H * 0.1, T * 0.12, H * 0.38);
      ctx.fillStyle = '#a0522d'; ctx.beginPath(); ctx.moveTo(X + W * 0.02, Y + H * 0.2); ctx.lineTo(cx, Y - H * 0.08); ctx.lineTo(X + W * 0.98, Y + H * 0.2); ctx.closePath(); ctx.fill();
      drawIcon(ctx, '🪣', cx, Y + H * 0.3, T * 0.42);
      board(ctx, cx, Y + H + T * 0.25, T, '水井', 'Giếng nước');
      break;
    }
    case 'exit': {
      if (o.to === 'forest') {
        const open = g.level >= BACKYARD_LVL;
        ctx.fillStyle = '#e6c793'; ctx.fillRect(X, Y, T, T);
        board(ctx, X + T * 1.9, Y - T * 0.65, T, '⬅ 后院', open ? 'Vườn cây & ao cá' : `🔒 Cấp ${BACKYARD_LVL}`, open ? '#fff8e8' : '#eeeeee');
      } else if (o.to === 'farm' && sc.id === 'forest') {
        ctx.fillStyle = '#e6c793'; ctx.fillRect(X, Y, W, H);
        label(ctx, '⬆ 回农场', cx, Y + T * 0.6, T, '#ef6c00', '#fff');
      } else {
        ctx.fillStyle = '#6d4c41'; ctx.fillRect(X + T * 0.1, Y, T * 0.8, T * 0.6);
        ctx.fillStyle = '#c62828'; rr(ctx, X + T * 0.05, Y + T * 0.55, T * 0.9, T * 0.4, 6); ctx.fill();
        label(ctx, '门', cx, Y + T * 0.3, T);
      }
      break;
    }
    case 'npc': {
      const n = g.npcWho();
      const b = Math.sin(t / 300) * 2;
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(cx, Y + T * 0.9, T * 0.28, T * 0.09, 0, 0, 7); ctx.fill();
      ctx.fillStyle = n.color; ctx.beginPath(); ctx.arc(cx, cy + b, T * 0.4, 0, 7); ctx.fill();
      drawIcon(ctx, n.face, cx, cy + b, T * 0.62);
      board(ctx, cx + T * 0.2, Y - T * 0.45 + b, T * 0.85, '你好！', '');
      break;
    }
    case 'bed': {
      ctx.fillStyle = '#8d6e63'; rr(ctx, X + 4, Y + 4, W - 8, H - 8, 8); ctx.fill();
      ctx.fillStyle = '#fff'; rr(ctx, X + 10, Y + 8, W - 20, T * 0.45, 6); ctx.fill();
      ctx.fillStyle = '#64b5f6'; rr(ctx, X + 8, Y + T * 0.65, W - 16, H - T * 0.75, 6); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 3; i++) ctx.fillRect(X + 12, Y + T * 0.8 + i * T * 0.35, W - 24, 3);
      label(ctx, '床 · 睡觉', cx, Y - T * 0.1, T);
      break;
    }
    case 'stove': {
      ctx.fillStyle = '#795548'; rr(ctx, X + 3, Y + 4, T - 6, T - 6, 6); ctx.fill();
      ctx.fillStyle = '#424242'; ctx.beginPath(); ctx.arc(cx, cy, T * 0.26, 0, 7); ctx.fill();
      drawIcon(ctx, '🍲', cx, cy, T * 0.4);
      label(ctx, '厨房 · 锅碗筷', cx, Y - T * 0.1, T);
      break;
    }
    case 'fridge': {
      ctx.fillStyle = '#eceff1'; rr(ctx, X + 6, Y + 2, T - 12, T - 4, 6); ctx.fill();
      ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(X + 6, Y + T * 0.4); ctx.lineTo(X + T - 6, Y + T * 0.4); ctx.stroke();
      label(ctx, '冰箱', cx, Y - T * 0.1, T);
      break;
    }
    case 'table': {
      ctx.fillStyle = '#a1693c'; rr(ctx, X + 4, Y + 6, W - 8, T - 12, 8); ctx.fill();
      ctx.fillStyle = '#c58a52'; rr(ctx, X + 8, Y + 9, W - 16, T - 20, 6); ctx.fill();
      drawIcon(ctx, '🍚', X + T * 0.6, cy, T * 0.36); drawIcon(ctx, '🥢', X + T * 1.3, cy, T * 0.36);
      label(ctx, '饭桌', cx, Y - T * 0.1, T);
      break;
    }
    case 'decor': {
      const d = DECOR.find(x => x.id === o.decor);
      if (o.decor === 'dec03') { ctx.fillStyle = '#e57373'; rr(ctx, X + 4, Y + 6, W - 8, H - 12, 8); ctx.fill(); ctx.strokeStyle = '#fff3e0'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.strokeRect(X + 10, Y + 12, W - 20, H - 24); ctx.setLineDash([]); break; }
      if (o.decor === 'dec07') { ctx.fillStyle = '#bfe6fb'; ctx.fillRect(X + 6, Y + T * 0.2, W - 12, T * 0.6); ctx.fillStyle = '#ef9a9a'; ctx.fillRect(X + 2, Y + T * 0.1, T * 0.25, T * 0.8); ctx.fillRect(X + W - T * 0.27, Y + T * 0.1, T * 0.25, T * 0.8); break; }
      drawIcon(ctx, d.icon, cx, cy, T * (o.y === 0 ? 0.55 : 0.75));
      break;
    }
    case 'tray': drawTray(ctx, g, sc, o, X, Y, T); break;
    case 'nest': {
      ctx.fillStyle = '#c8a24a'; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.1, T * 0.4, T * 0.26, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#a07a2a'; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.05, T * 0.26, T * 0.14, 0, 0, 7); ctx.fill();
      const pen = g.pens.chicken;
      if (pen.nests[o.slot]) { drawIcon(ctx, '🥚', cx, cy - T * 0.02, T * 0.38); sparkle(ctx, cx, cy, T, t); }
      if (o.slot >= pen.animals.length) { ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.1, T * 0.42, T * 0.28, 0, 0, 7); ctx.fill(); }
      break;
    }
    case 'animal': {
      const a = ANIMALS[SCENES[sc.id].animal];
      const an = g.pens[a.id].animals[o.slot];
      if (!an) break;
      ctx.fillStyle = '#d7b979'; rr(ctx, X - T * 0.2, Y - T * 0.05, T * 1.4, T * 1.1, 10); ctx.fill();
      const b = Math.sin(t / 500 + o.slot) * 2;
      const big = a.id === 'pig' ? 0.55 + 0.35 * Math.min(1, an.growth / a.growDays) : 0.85;
      drawIcon(ctx, a.icon, cx, cy + b, T * big);
      if (an.ready && a.product) { drawIcon(ctx, itemOf(a.product).icon, cx + T * 0.4, Y - T * 0.05, T * 0.36); sparkle(ctx, cx, cy, T, t); }
      if (a.id === 'pig' && pigGrown(an)) { drawIcon(ctx, '🥩', cx, Y - T * 0.2 + Math.sin(t / 300) * 2, T * 0.5); sparkle(ctx, cx, cy, T, t); }
      if (an.health < 40) label(ctx, '🤒', cx - T * 0.45, Y, T, 'rgba(255,255,255,0.9)');
      break;
    }
    case 'poop': {
      ctx.fillStyle = '#795548';
      ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.15, T * 0.2, T * 0.09, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.04, T * 0.14, T * 0.08, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy - T * 0.05, T * 0.08, T * 0.06, 0, 0, 7); ctx.fill();
      break;
    }
    case 'tree': drawTreeSlot(ctx, g, o, X, Y, T, t); break;
    case 'feeder': {
      const open = g.level >= BACKYARD_LVL;
      ctx.fillStyle = '#8d5a2b'; ctx.fillRect(cx - T * 0.06, cy - T * 0.2, T * 0.12, T * 0.6);
      ctx.fillStyle = open ? '#fff3e0' : '#e0e0e0'; rr(ctx, X + T * 0.05, Y + T * 0.05, T * 0.9, T * 0.42, 6); ctx.fill();
      ctx.strokeStyle = '#8d5a2b'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#4a2c12'; ctx.font = `700 ${Math.round(T * 0.26)}px "LXGW WenKai Lite",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('鱼塘', cx, Y + T * 0.27);
      break;
    }
    case 'pond': {
      (g.pond.fish || []).forEach((f, i) => {
        const a = t / (1800 + i * 170) + i * 1.7;
        const fx = X + W / 2 + Math.cos(a) * (W * 0.32 - (i % 3) * T * 0.4);
        const fy = Y + H / 2 + Math.sin(a * 1.3) * (H * 0.3 - (i % 2) * T * 0.4);
        const sp = FISH.find(s => s.id === f.sp);
        if (sp && (sp.icon === '🦐' || sp.icon === '🦀')) { ctx.globalAlpha = 0.6; drawIcon(ctx, sp.icon, fx, fy, T * 0.35); ctx.globalAlpha = 1; return; }
        ctx.fillStyle = sp && sp.icon === '🐠' ? 'rgba(255,140,40,0.75)' : 'rgba(30,60,90,0.35)';
        const sz = T * (0.14 + 0.08 * Math.min(1, f.age / 4));
        ctx.beginPath(); ctx.ellipse(fx, fy, sz * 1.6, sz * 0.7, a + Math.PI / 2, 0, 7); ctx.fill();
      });
      if (g.pond.fedToday) drawIcon(ctx, '✨', X + W - T * 0.5, Y + T * 0.5, T * 0.4);
      break;
    }
    default: break;
  }
}

// Chuồng: nhà mái màu + sân rào phía trước thấy con vật
function drawPen(ctx, g, o, X, Y, T, t) {
  const a = ANIMALS[o.animal];
  const pen = g.pens[a.id];
  const W = o.w * T;
  const cx = X + W / 2;
  const col = { chicken: ['#f6b93b', '#d6342a', '#b22a22'], pig: ['#f8a5c2', '#d63c7a', '#b0305f'], sheep: ['#e9e0cf', '#8d7b68', '#6f604f'], cow: ['#90caf9', '#2f6fd1', '#2457a8'] }[a.id];
  if (!pen.owned) {
    const can = g.level >= a.pen.lvl;
    ctx.strokeStyle = '#8d5a2b'; ctx.lineWidth = 4; ctx.setLineDash([8, 5]); ctx.strokeRect(X + 6, Y + T * 0.4, W - 12, T * 2.4); ctx.setLineDash([]);
    drawIcon(ctx, a.icon, cx, Y + T * 1.45, T * 0.8);
    board(ctx, cx, Y + T * 0.5, T * 0.85, a.pen.chn, can ? `Mua chuồng ${a.pen.cost}元` : `🔒 Cấp ${a.pen.lvl}`, can ? '#fff8e1' : '#eeeeee');
    return;
  }
  // nhà
  ctx.fillStyle = col[0]; ctx.fillRect(X + T * 0.35, Y + T * 0.75, W - T * 0.7, T * 1.05);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2; ctx.strokeRect(X + T * 0.35, Y + T * 0.75, W - T * 0.7, T * 1.05);
  roof(ctx, X + T * 0.15, Y + T * 0.15, W - T * 0.3, T * 0.65, col[1], col[2]);
  ctx.fillStyle = '#6d4c41'; ctx.fillRect(cx - T * 0.38, Y + T * 0.95, T * 0.76, T * 0.85);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(cx - T * 0.38, Y + T * 0.95, T * 0.76, T * 0.85);
  ctx.beginPath(); ctx.moveTo(cx - T * 0.38, Y + T * 0.95); ctx.lineTo(cx + T * 0.38, Y + T * 1.8); ctx.moveTo(cx + T * 0.38, Y + T * 0.95); ctx.lineTo(cx - T * 0.38, Y + T * 1.8); ctx.stroke();
  // sân rào
  ctx.fillStyle = '#e8cf95'; ctx.fillRect(X + T * 0.2, Y + T * 1.8, W - T * 0.4, T * 1.1);
  const shown = pen.animals.slice(0, 3);
  ctx.strokeStyle = '#a0693a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(X + T * 0.2, Y + T * 2.65); ctx.lineTo(X + W * 0.4, Y + T * 2.65); ctx.moveTo(X + W * 0.6, Y + T * 2.65); ctx.lineTo(X + W - T * 0.2, Y + T * 2.65); ctx.stroke();
  for (let i = 0; i <= 6; i++) { const px = X + T * 0.2 + (i * (W - T * 0.4)) / 6; if (px > X + W * 0.42 && px < X + W * 0.58) continue; ctx.fillStyle = '#c98a4b'; ctx.fillRect(px - 2, Y + T * 2.45, 5, T * 0.45); }
  board(ctx, cx, Y + T * 0.32, T * 0.82, `${a.pen.chn} ${pen.animals.length}${a.icon}`, '');
  // vật nuôi vẽ SAU hàng rào để thấy trọn cả con (không bị rào che nửa người)
  shown.forEach((an, i) => {
    const ax = X + T * (0.85 + i * 1.15);
    const ay = Y + T * 2.1 + Math.sin(t / 400 + i) * 1.5;
    drawIcon(ctx, a.icon, ax, ay, T * 0.66);
    if (a.id === 'pig' && pigGrown(an)) drawIcon(ctx, '🥩', ax, ay - T * 0.5, T * 0.36);
  });
  if (g.penNeedsCare(a.id)) drawIcon(ctx, '❗', X + W - T * 0.3, Y + T * 1.1, T * 0.4);
}

// Một ô đất 1×1: cuốc → gieo → tưới (vòng đậm dưới chân cây) → thu hoạch → vặt xác cây
function drawBed(ctx, g, o, X, Y, T, t) {
  const p = g.plots[o.idx];
  if (!p) return;
  const cx = X + T / 2;
  const cy = Y + T / 2;
  if (p.state === 'locked') {
    ctx.fillStyle = 'rgba(120,80,40,0.18)'; rr(ctx, X + 2, Y + 3, T - 4, T - 6, 8); ctx.fill();
    return;
  }
  if (p.state === 'sale') {
    ctx.strokeStyle = 'rgba(120,70,30,0.65)'; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; rr(ctx, X + 2, Y + 3, T - 4, T - 6, 8); ctx.stroke(); ctx.setLineDash([]);
    if (o.idx % BED_W === 0) label(ctx, `出售 · Mua ${PLOT_PRICE(bedOf(o.idx))}元`, X + (BED_W * T) / 2, cy, T, '#fff8e1', '#b45309');
    return;
  }
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; rr(ctx, X + 3, Y + 6, T - 5, T - 7, 8); ctx.fill();
  ctx.fillStyle = p.state === 'grass' ? '#b89a62' : '#a0703c';
  rr(ctx, X + 2, Y + 3, T - 4, T - 6, 8); ctx.fill();
  ctx.strokeStyle = '#7a4a22'; ctx.lineWidth = 2; ctx.stroke();
  if (p.state === 'grass') {
    ctx.strokeStyle = '#7cb342'; ctx.lineWidth = 1.5;
    [0.26, 0.5, 0.74].forEach((k, i) => { ctx.beginPath(); ctx.moveTo(X + T * k, Y + T * (0.72 - (i % 2) * 0.06)); ctx.lineTo(X + T * (k - 0.05), Y + T * 0.42); ctx.stroke(); });
    return;
  }
  // ô đã cuốc: một rãnh đất
  ctx.strokeStyle = 'rgba(90,55,20,0.4)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(X + T * 0.18, Y + T * 0.82); ctx.lineTo(X + T * 0.82, Y + T * 0.82); ctx.stroke();
  if (p.state === 'dead') {
    ctx.strokeStyle = '#8d6e3f'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, cy + T * 0.28); ctx.lineTo(cx - 4, cy - T * 0.22); ctx.moveTo(cx, cy + T * 0.08); ctx.lineTo(cx + T * 0.16, cy - T * 0.1); ctx.moveTo(cx - 2, cy - T * 0.02); ctx.lineTo(cx - T * 0.15, cy - T * 0.12); ctx.stroke();
    drawIcon(ctx, '🥀', cx, cy - T * 0.05, T * 0.46);
    return;
  }
  // đã tưới: vòng tròn đậm dưới chân cây báo hiệu cây đã được tưới
  if (p.crop && p.watered) {
    ctx.fillStyle = 'rgba(40,20,5,0.30)'; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.22, T * 0.36, T * 0.17, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(28,12,2,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.22, T * 0.36, T * 0.17, 0, 0, 7); ctx.stroke();
  }
  if (!p.crop) return;
  const c = itemOf(p.crop);
  const need = c.waits[Math.min(p.harvestNo || 0, c.waits.length - 1)];
  const prog = p.ripe ? 1 : p.grow / need;
  if (p.ripe) { drawIcon(ctx, c.icon, cx, cy - T * 0.06, T * 0.7); sparkle(ctx, cx, cy, T * 1.1, t); }
  else if (prog <= 0 && !(p.harvestNo > 0)) { ctx.fillStyle = '#4e342e'; ctx.beginPath(); ctx.arc(cx, cy + T * 0.1, T * 0.07, 0, 7); ctx.fill(); }
  else drawIcon(ctx, prog < 0.5 ? '🌱' : '🌿', cx, cy - T * 0.04, T * (0.42 + 0.3 * prog));
  if (!p.watered && !p.ripe) drawIcon(ctx, '💧', X + T * 0.84, Y + T * 0.14, T * 0.3);
}

function drawTray(ctx, g, sc, o, X, Y, T) {
  const a = ANIMALS[SCENES[sc.id].animal];
  const pen = g.pens[a.id];
  const full = o.tray === 'food' ? pen.food[o.slot] : pen.water[o.slot];
  const cx = X + T / 2;
  const cy = Y + T / 2;
  ctx.fillStyle = o.tray === 'food' ? '#8d6e63' : '#78909c'; rr(ctx, X + 5, Y + T * 0.25, T - 10, T * 0.5, 6); ctx.fill();
  ctx.fillStyle = full ? (o.tray === 'food' ? '#ffca28' : '#4fc3f7') : '#4e3b31';
  rr(ctx, X + 8, Y + T * 0.32, T - 16, T * 0.3, 4); ctx.fill();
  if (o.slot >= pen.animals.length) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(X + 4, Y + T * 0.22, T - 8, T * 0.56); }
  else if (!full) drawIcon(ctx, o.tray === 'food' ? '❗' : '💧', cx, cy - T * 0.3, T * 0.24);
}


function drawTreeSlot(ctx, g, o, X, Y, T, t) {
  const tr = g.trees[o.idx];
  const cx = X + T / 2;
  const cy = Y + T / 2;
  ctx.fillStyle = 'rgba(110,70,30,0.35)'; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.25, T * 0.42, T * 0.18, 0, 0, 7); ctx.fill();
  if (!tr) { if (g.level >= BACKYARD_LVL) label(ctx, '＋树苗', cx, cy, T, 'rgba(255,255,255,0.85)', '#2e7d32'); return; }
  const f = itemOf(tr.sp);
  if (tr.grow < f.grow) {
    drawIcon(ctx, tr.grow < f.grow / 2 ? '🌱' : '🌳', cx, cy, T * (0.45 + 0.4 * tr.grow / f.grow));
  } else {
    ctx.fillStyle = '#6d4c2c'; ctx.fillRect(cx - T * 0.08, cy, T * 0.16, T * 0.42);
    ctx.fillStyle = '#2e8b3e'; ctx.beginPath(); ctx.arc(cx, cy - T * 0.12, T * 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#3aa34c'; ctx.beginPath(); ctx.arc(cx - T * 0.15, cy - T * 0.25, T * 0.25, 0, 7); ctx.fill();
    if (tr.ripe) { [[-0.22, -0.2], [0.2, -0.05], [0.02, -0.38], [-0.05, 0.08]].slice(0, f.yield + 1).forEach(([a, b]) => drawIcon(ctx, f.icon, cx + a * T, cy + b * T, T * 0.28)); sparkle(ctx, cx, cy - T * 0.1, T, t); }
  }
  if (!tr.watered && !tr.ripe) drawIcon(ctx, '💧', X + T * 0.9, Y, T * 0.26);
}



// Vẽ toàn cảnh
function renderScene(ctx, g, view, t) {
  const sc = g.scene;
  const T = view.T;
  const outdoor = sc.id === 'farm' || sc.id === 'forest';
  ctx.fillStyle = sc.id === 'forest' ? '#2f6b2b' : sc.id === 'farm' ? '#3f8c3a' : '#5d4037';
  ctx.fillRect(0, 0, view.cw, view.ch);
  const x0 = Math.max(0, Math.floor(-view.ox / T));
  const y0 = Math.max(0, Math.floor(-view.oy / T));
  const x1 = Math.min(sc.cols - 1, Math.ceil((view.cw - view.ox) / T));
  const y1 = Math.min(sc.rows - 1, Math.ceil((view.ch - view.oy) / T));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const ch = sc.base[y][x];
    drawTile2(ctx, ch === 't' || ch === 'b' ? 'g' : ch, x, y, view.ox + x * T, view.oy + y * T, T, t, sc.id);
  }
  if (g.walk && g.walk.target) {
    const [tx, ty] = g.walk.target;
    const p = 0.5 + 0.5 * Math.sin(t / 160);
    ctx.strokeStyle = `rgba(255,255,255,${0.5 + p * 0.4})`; ctx.lineWidth = 3;
    rr(ctx, view.ox + tx * T + 3, view.oy + ty * T + 3, T - 6, T - 6, 8); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    (g.walk.path || []).forEach(([px, py]) => { ctx.beginPath(); ctx.arc(view.ox + px * T + T / 2, view.oy + py * T + T / 2, T * 0.06, 0, 7); ctx.fill(); });
  }
  const items = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const ch = sc.base[y][x]; if (ch === 't' || ch === 'b') items.push({ y: y + 0.9, draw: () => drawTile(ctx, ch, x, y, view.ox + x * T, view.oy + y * T, T, t, sc.id) }); }
  sc.objs.forEach(o => items.push({ y: o.kind === 'poop' || o.kind === 'plot' || o.isPond || o.kind === 'decor' && o.decor === 'dec03' ? o.y - 0.5 : o.y + o.h - 0.5, draw: () => drawObj(ctx, g, sc, o, view.ox + o.x * T, view.oy + o.y * T, T, t) }));
  if (sc.id === 'pen_chicken') g.pens.chicken.animals.forEach((an, i) => {
    const a = t / (2500 + i * 300) + i * 2;
    const hx = 6.5 + Math.cos(a) * 2.6 + (i % 2) * 0.4;
    const hy = 4.6 + Math.sin(a * 1.4) * 1.3;
    items.push({ y: hy + 0.4, draw: () => { drawIcon(ctx, '🐔', view.ox + hx * T, view.oy + hy * T - Math.abs(Math.sin(t / 200 + i)) * 3, T * 0.62); if (an.health < 40) drawIcon(ctx, '🤒', view.ox + hx * T + T * 0.3, view.oy + hy * T - T * 0.35, T * 0.26); } });
  });
  // thú cưng: chó đi theo nhân vật, mèo đuổi chuột trong nhà
  if (g.pets.dog && g.dogPos && !sc.id.startsWith('pen_')) {
    const d = g.dogPos;
    items.push({ y: d.y + 0.9, draw: () => drawIcon(ctx, '🐕', view.ox + (d.x + 0.5) * T, view.oy + (d.y + 0.55) * T - Math.abs(Math.sin(t / 120)) * (d.moving ? 3 : 0), T * 0.62) });
  }
  if (g.pets.cat && sc.id === 'house') {
    const a = t / 2600;
    const mx = 6 + Math.cos(a) * 3.6;
    const my = 4.6 + Math.sin(a * 2) * 1.1;
    const cx2 = 6 + Math.cos(a - 0.5) * 3.6;
    const cy2 = 4.6 + Math.sin((a - 0.5) * 2) * 1.1;
    items.push({ y: my + 0.5, draw: () => drawIcon(ctx, '🐭', view.ox + mx * T, view.oy + my * T, T * 0.36) });
    items.push({ y: cy2 + 0.6, draw: () => drawIcon(ctx, '🐈', view.ox + cx2 * T, view.oy + cy2 * T - Math.abs(Math.sin(t / 110)) * 3, T * 0.6) });
  }
  const pl = g.player;
  items.push({ y: pl.y + 0.95, draw: () => drawPlayer(ctx, view.ox + pl.x * T + T / 2, view.oy + pl.y * T + T * 0.45, T, pl.face, !!(g.walk && g.walk.moving), t) });
  items.sort((a, b) => a.y - b.y).forEach(it => it.draw());
  // thời tiết: mưa → trời tối, hạt mưa rơi liên tục, vũng nước gợn sóng
  if (outdoor && g.weather === 'rain') {
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#5f7898'; ctx.fillRect(0, 0, view.cw, view.ch); ctx.globalCompositeOperation = 'source-over';
    const vg = ctx.createRadialGradient(view.cw / 2, view.ch / 2, view.ch * 0.3, view.cw / 2, view.ch / 2, view.cw * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(5,15,30,0.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, view.cw, view.ch);
    for (let i = 0; i < 14; i++) {
      const k = ((t / 1400) + seeded(i, 9)) % 1;
      const px = view.ox + (2 + seeded(i, 4) * (sc.cols - 4)) * T;
      const py = view.oy + (3 + seeded(i, 5) * (sc.rows - 5)) * T;
      ctx.strokeStyle = `rgba(220,235,255,${0.5 * (1 - k)})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(px, py, T * 0.5 * k + 2, T * 0.18 * k + 1, 0, 0, 7); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(210,228,255,0.6)'; ctx.lineWidth = 1.3; ctx.beginPath();
    for (let i = 0; i < 160; i++) {
      const sp = 0.7 + seeded(i, 2) * 0.5;
      const rx = (seeded(i, 1) * (view.cw + 60) + t * 0.08 * sp) % (view.cw + 60) - 30;
      const ry = (seeded(i, 3) * view.ch + t * 0.75 * sp) % view.ch;
      ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 13);
    }
    ctx.stroke();
  } else if (outdoor && g.weather === 'cloudy') {
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#cfd6e0'; ctx.fillRect(0, 0, view.cw, view.ch); ctx.globalCompositeOperation = 'source-over';
  }
  g.floaters = g.floaters.filter(f => t - f.t0 < 1600);
  g.floaters.forEach(f => {
    const k = (t - f.t0) / 1600;
    ctx.globalAlpha = 1 - k * k;
    label(ctx, f.text, view.ox + f.x * T + T / 2, view.oy + f.y * T - T * 0.4 - k * T * 0.8, T * 1.15, 'rgba(255,255,255,0.95)', f.color || '#c2410c');
    ctx.globalAlpha = 1;
  });
}


// ============================================================================
// 6. MÁY CHỦ: TÀI KHOẢN, LƯU TIẾN TRÌNH, BẢNG XẾP HẠNG
// ============================================================================
const GameCloud = {
  key: 'farm',
  apiBase() {
    const h = window.location.hostname;
    if (window.location.protocol === 'file:' || h === 'localhost' || h === '127.0.0.1' || h === '') return 'http://localhost:5000';
    if (h.includes('tieng-trung-hong-tai-1.onrender.com')) return 'https://tiengtrunghongtai.online';
    return window.location.origin;
  },
  token() {
    try {
      const t = localStorage.getItem('session_token') || localStorage.getItem('sessionToken') || '';
      return t && t !== 'null' && t !== 'undefined' && t !== 'guest' ? t : '';
    } catch (e) { return ''; }
  },
  signedIn() { return !!(this.token() || this.localUser()); },
  localUser() {
    try {
      const u = JSON.parse(localStorage.getItem('user') || localStorage.getItem('currentUser') || 'null');
      return u && u.email ? u : null;
    } catch (e) { return null; }
  },
  async request(path, options = {}, timeoutMs = 8000) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    const headers = { 'Content-Type': 'application/json' };
    const t = this.token();
    if (t) { headers.Authorization = `Bearer ${t}`; headers['x-session-token'] = t; }
    const lu = this.localUser();
    if (lu && lu.email) headers['x-user-email'] = String(lu.email).toLowerCase().trim();
    try {
      const res = await fetch(this.apiBase() + path, { credentials: 'include', cache: 'no-store', ...options, headers, signal: ctrl ? ctrl.signal : undefined });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      if (timer) clearTimeout(timer);
    }
  },
  getProgress() { return this.request(`/api/${this.key}/progress`); },
  post(body) { return this.request(`/api/${this.key}/progress`, { method: 'POST', body: JSON.stringify(body), keepalive: true }); },
  getLeaderboard() { return this.request(`/api/${this.key}/leaderboard?limit=50`); }
};

const LocalSave = {
  key(owner) { return `${GameCloud.key}_save_${owner || 'guest'}`; },
  read(owner) {
    try {
      const s = JSON.parse(localStorage.getItem(this.key(owner)) || 'null');
      return s && typeof s === 'object' && s.v === SAVE_VERSION ? s : null;
    } catch (e) { return null; }
  },
  write(owner, s) { try { localStorage.setItem(this.key(owner), JSON.stringify(s)); } catch (e) {} },
  clear(owner) { try { localStorage.removeItem(this.key(owner)); } catch (e) {} }
};

// ============================================================================
// 7. GAME
// ============================================================================
const newAnimal = () => ({ health: 100, growth: 0, prog: 0, ready: false });
const SPEED = 4.2;   // ô / giây

class FarmGame {
  constructor() {
    this.audio = new FarmAudio();
    this.showPinyin = true;
    this.showVietnamese = true;
    this.autoVoice = true;
    this.inspect = false;
    this.floaters = [];
    this.walk = null;
    this.dirty = false;
    this.lastCloudSave = 0;
    this.view = { T: 40, ox: 0, oy: 0, cw: 0, ch: 0 };
    this.hover = null;
    const lu = GameCloud.localUser();
    this.owner = lu ? String(lu.email).toLowerCase().trim() : 'guest';
    this.cloud = { checked: false, loggedIn: false, offline: false, name: '', picture: '', best: null, history: [] };
    this.rankTab = 'global';
    const local = LocalSave.read(this.owner);
    if (!(local && this.applySnapshot(local))) this.newFarm();
    this.initDOM();
    this.fitStage();
    this.renderHUD();
    this.showTitleScreen();
    this.lastFrame = performance.now();
    const loop = (ts) => { this.frame(ts); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    this.cloudReady = this.initCloud().catch(() => {}).finally(() => {
      this.cloud.checked = true;
      this.renderAccountChip();
      if (this.isTitleVisible()) this.showTitleScreen();
    });
  }

  // --------------------------------------------------------------------------
  // Trạng thái
  // --------------------------------------------------------------------------
  resetState() {
    this.day = 1;
    this.weather = 'sunny';
    this.money = START.money;
    this.energy = ENERGY_MAX;
    this.level = 1;
    this.xp = 0;
    this.pets = { dog: false, cat: false };
    this.decor = [];
    this.tasks = [];
    this.today = {};
    this.todaySent = [];
    this.sentSeen = new Set();
    this.dogPos = null;
    this.bag = { ...START.bag };
    this.fridge = {};
    this.plots = PLOT_POS.map((_, i) => ({ state: bedOf(i) < 2 ? 'grass' : 'locked', crop: null, grow: 0, harvestNo: 0, watered: false, ripe: false, fert: false }));
    this.trees = ORCHARD_POS.map(() => null);
    this.pens = {};
    ANIMAL_IDS.forEach(id => {
      const a = ANIMALS[id];
      this.pens[id] = { owned: id === 'chicken', animals: [], food: Array(a.slots).fill(false), water: Array(a.slots).fill(false), nests: Array(id === 'chicken' ? 6 : 0).fill(false), poops: [] };
    });
    this.pens.chicken.animals = [newAnimal(), newAnimal()];
    this.pens.chicken.nests[0] = true;
    this.pens.chicken.nests[1] = true;
    this.pond = { fish: [], fedToday: false };
    this.sceneId = 'farm';
    this.player = { x: 3, y: 6, face: 'down' };
    this.npc = null;
    this.stats = { harvests: 0, eggs: 0, pigFed: 0, forest: 0, trees: 0, fishCaught: 0, sold: 0, income: 0, cleaned: 0, talks: 0 };
    this.dayIncome = 0;
    this.learned = new Set(['农场', '你好']);
    this.records = [];
    this.savedAt = 0;
  }
  newFarm() { this.resetState(); this.refreshBeds(); this.startDay(); this.rebuild(); }

  snapshot() {
    return {
      v: SAVE_VERSION, updatedAt: Date.now(),
      day: this.day, weather: this.weather, money: this.money, energy: this.energy, level: this.level, xp: this.xp, pets: this.pets, decor: this.decor,
      tasks: this.tasks, today: this.today, todaySent: this.todaySent, sentSeen: [...this.sentSeen],
      bag: this.bag, fridge: this.fridge, plots: this.plots, trees: this.trees, pens: this.pens, pond: this.pond,
      sceneId: this.sceneId, player: { x: this.player.x, y: this.player.y, face: this.player.face },
      npc: this.npc, stats: this.stats, dayIncome: this.dayIncome,
      vocab: [...this.learned], records: this.records.slice(-60),
      settings: { pinyin: this.showPinyin, vi: this.showVietnamese, voice: this.autoVoice }
    };
  }
  applySnapshot(s) {
    if (!s || s.v !== SAVE_VERSION) return false;
    const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
    const int = (v, lo, hi, d) => clamp(Math.round(num(v, d)), lo, hi);
    const counts = (o, cap) => { const out = {}; if (o && typeof o === 'object') Object.keys(o).forEach(k => { if (ITEMS[k]) { const n = int(o[k], 0, cap, 0); if (n) out[k] = n; } }); return out; };
    this.resetState();
    this.day = int(s.day, 1, 100000, 1);
    this.weather = WEATHERS[s.weather] ? s.weather : 'sunny';
    this.money = int(s.money, 0, 1e9, START.money);
    this.energy = int(s.energy, 0, ENERGY_MAX, ENERGY_MAX);
    this.level = int(s.level, 1, LEVEL_MAX, 1);
    this.xp = int(s.xp, 0, 1e9, 0);
    if (s.pets) this.pets = { dog: !!s.pets.dog, cat: !!s.pets.cat };
    this.decor = Array.isArray(s.decor) ? s.decor.filter(k => DECOR.some(d => d.id === k)) : [];
    this.tasks = Array.isArray(s.tasks) ? s.tasks.filter(t => t && typeof t.key === 'string').slice(0, 6).map(t => ({ key: t.key, need: int(t.need, 1, 99, 1), zh: String(t.zh || ''), pin: String(t.pin || ''), vi: String(t.vi || ''), done: !!t.done })) : [];
    this.today = s.today && typeof s.today === 'object' ? Object.fromEntries(Object.entries(s.today).map(([k, v]) => [k, int(v, 0, 999, 0)])) : {};
    this.todaySent = Array.isArray(s.todaySent) ? s.todaySent.filter(i => SENTENCES[i]) : [];
    if (Array.isArray(s.sentSeen)) s.sentSeen.forEach(i => { if (SENTENCES[i]) this.sentSeen.add(i); });
    this.bag = counts(s.bag, 9999);
    this.fridge = counts(s.fridge, 9999);
    let srcPlots = Array.isArray(s.plots) ? s.plots : null;
    if (srcPlots && srcPlots.length <= BED_POS.length) srcPlots = srcPlots.flatMap(p => (p && typeof p === 'object' ? Array.from({ length: BED_W }, () => ({ ...p })) : Array(BED_W).fill(null)));
    if (srcPlots) srcPlots.slice(0, PLOT_POS.length).forEach((p, i) => {
      if (!p || typeof p !== 'object') return;
      const st = ['locked', 'sale', 'grass', 'tilled', 'dead'].includes(p.state) ? p.state : 'locked';
      const crop = p.crop && ITEMS[p.crop] && ITEMS[p.crop].kind === 'crop' ? p.crop : null;
      this.plots[i] = { state: st, crop: st === 'tilled' ? crop : null, grow: int(p.grow, 0, 99, 0), harvestNo: int(p.harvestNo, 0, 9, 0), watered: !!p.watered, ripe: !!p.ripe, fert: !!p.fert };
    });
    if (Array.isArray(s.trees)) s.trees.slice(0, ORCHARD_POS.length).forEach((t, i) => {
      if (t && FRUITS.some(f => f.id === t.sp)) this.trees[i] = { sp: t.sp, grow: int(t.grow, 0, 99, 0), prog: int(t.prog, 0, 99, 0), watered: !!t.watered, ripe: !!t.ripe };
    });
    if (s.pens && typeof s.pens === 'object') ANIMAL_IDS.forEach(id => {
      const src = s.pens[id];
      const a = ANIMALS[id];
      if (!src || typeof src !== 'object') return;
      const bools = (arr, n) => Array.from({ length: n }, (_, i) => !!(Array.isArray(arr) && arr[i]));
      this.pens[id] = {
        owned: id === 'chicken' ? true : !!src.owned,
        animals: (Array.isArray(src.animals) ? src.animals : []).slice(0, a.slots).map(an => ({ health: int(an && an.health, 0, 100, 100), growth: int(an && an.growth, 0, 999, 0), prog: int(an && an.prog, 0, 99, 0), ready: !!(an && an.ready) })),
        food: bools(src.food, a.slots), water: bools(src.water, a.slots), nests: bools(src.nests, id === 'chicken' ? 6 : 0),
        poops: (Array.isArray(src.poops) ? src.poops : []).filter(p => Array.isArray(p) && p.length === 2).slice(0, 10).map(([x, y]) => [int(x, 2, 10, 5), int(y, 2, 7, 4)])
      };
    });
    if (s.pond && typeof s.pond === 'object') this.pond = { fedToday: !!s.pond.fedToday, fish: (Array.isArray(s.pond.fish) ? s.pond.fish : []).filter(f => f && FISH.some(x => x.id === f.sp)).slice(0, POND_CAP).map(f => ({ sp: f.sp, age: int(f.age, 0, 999, 0) })) };
    this.sceneId = SCENES[s.sceneId] ? s.sceneId : 'farm';
    if (s.player) this.player = { x: int(s.player.x, 0, 30, 3), y: int(s.player.y, 0, 20, 5), face: ['up', 'down', 'left', 'right'].includes(s.player.face) ? s.player.face : 'down' };
    this.npc = s.npc && NPC_DLG[s.npc.dlg] ? { dlg: int(s.npc.dlg, 0, NPC_DLG.length - 1, 0), done: !!s.npc.done } : null;
    if (s.stats && typeof s.stats === 'object') Object.keys(this.stats).forEach(k => { this.stats[k] = int(s.stats[k], 0, 1e9, 0); });
    this.dayIncome = int(s.dayIncome, 0, 1e9, 0);
    if (Array.isArray(s.vocab)) s.vocab.forEach(w => { if (typeof w === 'string') this.learned.add(w); });
    this.records = Array.isArray(s.records) ? s.records.filter(r => r && Number.isFinite(Number(r.day))) : [];
    if (s.settings) { this.showPinyin = s.settings.pinyin !== false; this.showVietnamese = s.settings.vi !== false; this.autoVoice = s.settings.voice !== false; }
    this.savedAt = num(s.updatedAt, 0);
    this.refreshBeds();
    if (!this.tasks.length && !this.todaySent.length) this.startDay();
    this.rebuild();
    const sc = this.scene;
    if (this.player.x >= sc.cols || this.player.y >= sc.rows || sc.block[this.player.y][this.player.x]) { this.sceneId = 'farm'; this.rebuild(); this.player = { x: 3, y: 6, face: 'down' }; }
    return true;
  }

  markDirty() { this.dirty = true; }
  saveNow(force = false) {
    if (!this.dirty && !force) return;
    const snap = this.snapshot();
    this.savedAt = snap.updatedAt;
    LocalSave.write(this.owner, snap);
    this.dirty = false;
    const t = Date.now();
    if (this.cloud.loggedIn && (force || t - this.lastCloudSave > 20000)) {
      this.lastCloudSave = t;
      GameCloud.post({ save: snap }).catch(() => {});
    }
  }

  // --------------------------------------------------------------------------
  // Tiện ích
  // --------------------------------------------------------------------------
  $(id) { return document.getElementById(id); }
  setText(id, text) { const el = this.$(id); if (el) el.textContent = text; }
  showToast(icon, text, kind = '') {
    const box = this.$('g-toasts');
    if (!box) return;
    const el = document.createElement('div');
    el.className = `g-toast ${kind}`;
    el.innerHTML = `<span class="t-icon">${icon}</span><span>${escapeHtml(text)}</span>`;
    box.appendChild(el);
    while (box.children.length > (this.isPortrait ? 1 : 2)) box.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 3000);
  }
  warn(icon, text) { this.audio.error(); this.showToast(icon, text, 'warn'); }
  learn(word) {
    if (!word || this.learned.has(word)) return;
    if (!VOCAB_INDEX[word]) return;
    this.learned.add(word);
    this.setText('hud-vocab-val', `${this.learnedCount()}/${VOCAB_TOTAL}`);
    this.markDirty();
  }
  learnedCount() { return Object.keys(VOCAB_INDEX).filter(w => this.learned.has(w)).length; }
  say(word) { if (this.autoVoice) this.audio.speak(word); }
  float(text, color) { this.floaters.push({ text, x: this.player.x, y: this.player.y, t0: performance.now(), color }); }
  // nói + hiện chữ bay cho 1 hành động (vd 浇水)
  actWord(chn, extra = '') {
    const w = wordOf(chn);
    this.learn(chn);
    this.float(`${chn}${w && this.showPinyin ? ` ${w.pin}` : ''}${extra}`);
    this.say(chn);
  }
  isModalOpen() { return [...document.querySelectorAll('.g-modal')].some(m => m.style.display === 'flex'); }
  isTitleVisible() { const t = this.$('title-screen'); return !!t && !t.classList.contains('hidden'); }
  openModal(id) { const m = this.$(id); if (m) m.style.display = 'flex'; }
  closeModal(id) { const m = this.$(id); if (m) m.style.display = 'none'; }
  isOpen(id) { const m = this.$(id); return !!m && m.style.display === 'flex'; }
  wordLine(w) {
    return `<div class="w-line"><b class="zh">${escapeHtml(w.zh || w.chn)}</b><button type="button" class="say-btn" data-say-chn="${escapeHtml(w.zh || w.chn)}" title="Nghe"><i class="fa-solid fa-volume-high"></i></button>
      ${this.showPinyin ? `<div class="w-pin">${escapeHtml(w.pin)}</div>` : ''}${this.showVietnamese ? `<div class="w-vi">${escapeHtml(w.vi)}</div>` : ''}</div>`;
  }

  // --------------------------------------------------------------------------
  // Túi đồ, tủ lạnh, tiền, năng lượng
  // --------------------------------------------------------------------------
  has(id, n = 1) { return (this.bag[id] || 0) >= n; }
  bagUsed() { return Object.keys(this.bag).reduce((s, k) => s + (countsInBag(ITEMS[k]) ? this.bag[k] : 0), 0); }
  fridgeUsed() { return Object.values(this.fridge).reduce((s, n) => s + n, 0); }
  bagCap() { return BAG_CAP + (this.has('basket') ? BASKET_BONUS : 0); }
  bagFree() { return this.bagCap() - this.bagUsed(); }
  canAdd(id, n) {
    const it = ITEMS[id];
    if (it.kind === 'water') return (this.bag.water || 0) + n <= WATER_CAP;
    if (it.kind === 'tool') return !this.has(id);
    if (!countsInBag(it)) return true;
    return this.bagFree() >= n;
  }
  give(id, n) { this.bag[id] = (this.bag[id] || 0) + n; this.markDirty(); }
  take(id, n = 1) {
    if ((this.bag[id] || 0) < n) return false;
    this.bag[id] -= n;
    if (!this.bag[id]) delete this.bag[id];
    this.markDirty();
    return true;
  }
  // lấy nguyên liệu: ưu tiên tủ lạnh rồi túi
  stockAll(id) { return (this.bag[id] || 0) + (this.fridge[id] || 0); }
  takeAny(id, n = 1) {
    if (this.stockAll(id) < n) return false;
    const f = Math.min(this.fridge[id] || 0, n);
    if (f) { this.fridge[id] -= f; if (!this.fridge[id]) delete this.fridge[id]; }
    if (n - f) this.take(id, n - f);
    this.markDirty();
    return true;
  }
  needEnergy(n) {
    if (this.energy >= n) return true;
    this.learn('累');
    this.learn('体力');
    this.warn('😩', `累了！Không đủ năng lượng (cần ${n}, còn ${this.energy}). Vào nhà ăn món ăn ở 饭桌 hoặc lên giường ngủ.`);
    this.say('我累了');
    return false;
  }
  useEnergy(n) { this.energy = clamp(this.energy - n, 0, ENERGY_MAX); this.renderHUD(); this.markDirty(); }
  addMoney(n, sold = 0) {
    this.money += n;
    if (n > 0) { this.stats.income += n; this.dayIncome += n; this.stats.sold += sold; }
    this.audio.coin();
    this.renderHUD();
    this.markDirty();
  }
  animalCount(id) { return this.pens[id].owned ? this.pens[id].animals.length : 0; }
  maxAnimals(id) { return this.level >= ANIMALS[id].lvl ? MAX_PER_PEN : 0; }
  npcWho() { return this.npc ? NPC_DLG[this.npc.dlg].who : NPC_TOPIC['Chào hỏi, thăm nhà']; }
  penNeedsCare(id) {
    const p = this.pens[id];
    if (!p.owned) return false;
    return p.animals.some((_, i) => !p.food[i] || !p.water[i]) || p.poops.length > 0 || p.nests.some(Boolean) || p.animals.some(a => a.ready) || (id === 'pig' && p.animals.some(pigGrown));
  }

  // Luống được phép mua theo cấp
  refreshBeds() {
    const allowed = bedsAllowed(this.level);
    this.plots.forEach((p, i) => { if (bedOf(i) < allowed && p.state === 'locked') p.state = 'sale'; });
  }

  // --------------------------------------------------------------------------
  // Khu vực & di chuyển
  // --------------------------------------------------------------------------
  rebuild() { this.scene = buildScene(this, this.sceneId); }
  changeScene(id, x, y, face = 'down') {
    this.sceneId = id;
    this.walk = null;
    this.rebuild();
    this.player = { x, y, face };
    this.audio.door();
    if (id === 'forest') { this.stats.forest += 1; this.learn('后院'); this.learn('果园'); }
    this.learn(SCENES[id].chn);
    this.dogPos = { x, y };
    this.renderHUD();
    this.markDirty();
  }

  // Nhấp vào bản đồ
  onMapClick(tx, ty) {
    if (this.isModalOpen() || this.isTitleVisible()) return;
    const sc = this.scene;
    if (tx < 0 || ty < 0 || tx >= sc.cols || ty >= sc.rows) return;
    this.audio.init();
    const o = objAt(sc, tx, ty);
    if (this.inspect) { this.inspectAt(o, tx, ty); return; }
    if (o) { this.interact(o, tx, ty); return; }
    if (sc.block[ty][tx]) { this.warn('🚧', 'Không đi vào ô này được (cây, tường hoặc vật cản).'); return; }
    this.walkTo([[tx, ty]], null, [tx, ty]);
  }

  // Tìm đường tới 1 trong các ô đích; onArrive chạy khi tới nơi (lệnh mới thay lệnh cũ)
  walkTo(goals, onArrive, target) {
    const w = this.walk;
    const from = w && w.to ? w.to : [this.player.x, this.player.y];
    const path = findPath(this.scene, from, goals);
    if (!path) { this.warn('🚫', 'Không có đường đi tới đó — thử chỗ khác nhé.'); return false; }
    if (w && w.to) { w.queue = path; w.onArrive = onArrive; w.target = target; w.path = path; }
    else this.walk = { queue: path, onArrive, target, path, to: null, from: null, k: 0, moving: false };
    if (!path.length && !(w && w.to)) this.arrive();
    return true;
  }
  arrive() {
    const w = this.walk;
    this.walk = null;
    if (w && w.onArrive) w.onArrive();
  }
  updateWalk(dt) {
    const w = this.walk;
    if (!w) return;
    if (!w.to) {
      if (!w.queue.length) { this.arrive(); return; }
      w.from = [this.player.x, this.player.y];
      w.to = w.queue.shift();
      w.k = 0;
      w.moving = true;
      const dx = w.to[0] - w.from[0];
      const dy = w.to[1] - w.from[1];
      this.player.face = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
    }
    w.k += dt * SPEED;
    if (w.k >= 1) {
      if (this.pets.dog) this.dogTarget = [w.from[0], w.from[1]];
      this.player.x = w.to[0];
      this.player.y = w.to[1];
      w.to = null;
      w.path = w.queue;
      if (Math.random() < 0.5) this.audio.step();
      if (!w.queue.length) { w.moving = false; this.arrive(); }
      return;
    }
    this.player.x = w.from[0] + (w.to[0] - w.from[0]) * w.k;
    this.player.y = w.from[1] + (w.to[1] - w.from[1]) * w.k;
  }
  faceTo(o) {
    const cx = o.x + (o.w - 1) / 2;
    const cy = o.y + (o.h - 1) / 2;
    const dx = cx - this.player.x;
    const dy = cy - this.player.y;
    this.player.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  // đi tới vật rồi làm việc
  goDo(o, fn, tx, ty) {
    const goals = standTiles(this.scene, o, tx, ty);
    if (o.isPond && tx != null) goals.sort((a, b) => (Math.abs(a[0] - tx) + Math.abs(a[1] - ty)) - (Math.abs(b[0] - tx) + Math.abs(b[1] - ty)));
    const pick = o.isPond && tx != null ? goals.slice(0, 4) : goals;
    this.walkTo(pick, () => { this.faceTo(o.isPond && tx != null ? { x: tx, y: ty, w: 1, h: 1 } : o); fn(); }, [o.x, o.y]);
  }

  // --------------------------------------------------------------------------
  // Khung hình
  // --------------------------------------------------------------------------
  frame(ts) {
    const dt = Math.min(0.05, (ts - this.lastFrame) / 1000);
    this.lastFrame = ts;
    if (this.isTitleVisible()) return;
    if (!this.isModalOpen()) this.updateWalk(dt);
    this.updateDog(dt);
    const rainOn = !this.sleeping && !this.isTitleVisible() && this.weather === 'rain' && (this.sceneId === 'farm' || this.sceneId === 'forest');
    if (rainOn !== this._rainOn) { this._rainOn = rainOn; this.audio.setRain(rainOn); }
    this.layoutView();
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    renderScene(ctx, this, this.view, ts);
    if (this.hover && !this.walk) {
      const [hx, hy] = this.hover;
      const T = this.view.T;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(this.view.ox + hx * T + 2, this.view.oy + hy * T + 2, T - 4, T - 4);
      ctx.setLineDash([]);
    }
    if (ts - (this._lastSave || 0) > 8000) { this._lastSave = ts; this.saveNow(); }
  }
  updateDog(dt) {
    if (!this.pets.dog) return;
    if (!this.dogPos) this.dogPos = { x: this.player.x, y: this.player.y };
    const tg = this.dogTarget || [this.player.x, this.player.y];
    const dx = tg[0] - this.dogPos.x;
    const dy = tg[1] - this.dogPos.y;
    const d = Math.hypot(dx, dy);
    this.dogPos.moving = d > 0.05;
    if (d > 6) { this.dogPos.x = tg[0]; this.dogPos.y = tg[1]; return; }
    if (d > 0.05) { const k = Math.min(1, (dt * SPEED * 1.1) / d); this.dogPos.x += dx * k; this.dogPos.y += dy * k; }
  }
  layoutView() {
    const cv = this.$('farm-canvas');
    if (!cv) return;
    const wrap = cv.parentElement;
    const cw = wrap.clientWidth;
    const ch = wrap.clientHeight;
    const dpr = Math.min(2.5, (window.devicePixelRatio || 1) * (this.stageScale || 1));
    if (cv.width !== Math.round(cw * dpr) || cv.height !== Math.round(ch * dpr)) {
      cv.width = Math.round(cw * dpr);
      cv.height = Math.round(ch * dpr);
      cv.style.width = `${cw}px`;
      cv.style.height = `${ch}px`;
    }
    this.ctx = this.ctx || cv.getContext('2d');
    this.dpr = dpr;
    const sc = this.scene;
    const fit = Math.min(cw / sc.cols, ch / sc.rows);
    // vừa khung thì hiện cả bản đồ; màn hẹp (điện thoại dọc) thì phóng ô cho kín chiều cao, camera đi theo nhân vật
    const T = fit >= MIN_TILE ? Math.floor(fit) : clamp(Math.floor(ch / sc.rows), MIN_TILE, 58);
    const mw = sc.cols * T;
    const mh = sc.rows * T;
    const px = (this.player.x + 0.5) * T;
    const py = (this.player.y + 0.5) * T;
    const ox = mw <= cw ? (cw - mw) / 2 : clamp(cw / 2 - px, cw - mw, 0);
    const oy = mh <= ch ? (ch - mh) / 2 : clamp(ch / 2 - py, ch - mh, 0);
    this.view = { T, ox, oy, cw, ch };
  }
  eventTile(e) {
    const cv = this.$('farm-canvas');
    const r = cv.getBoundingClientRect();
    const k = cv.clientWidth / r.width;
    const x = (e.clientX - r.left) * k;
    const y = (e.clientY - r.top) * k;
    return [Math.floor((x - this.view.ox) / this.view.T), Math.floor((y - this.view.oy) / this.view.T)];
  }


  // --------------------------------------------------------------------------
  // Cấp độ & EXP
  // --------------------------------------------------------------------------
  addXP(n) {
    if (n <= 0 || this.level >= LEVEL_MAX) return;
    this.xp += n;
    const gained = [];
    while (this.level < LEVEL_MAX && this.xp >= xpTotal(this.level + 1)) { this.level += 1; gained.push(this.level); }
    if (gained.length) {
      gained.forEach(L => { this.money += 10 * L; });
      this.refreshBeds();
      this.rebuild();
      this.learn('升级');
      this.learn('等级');
      this.showLevelUp(gained);
    }
    this.renderHUD();
    this.markDirty();
  }
  bump(key, n = 1) {
    this.today[key] = (this.today[key] || 0) + n;
    (this.tasks || []).forEach(tk => {
      if (tk.done || tk.key !== key) return;
      if (this.today[key] >= tk.need) {
        tk.done = true;
        this.money += 5;
        this.learn('任务');
        this.showToast('✅', `完成任务！Xong nhiệm vụ: ${tk.vi} · +${EXP.task} EXP, +5元`);
        this.audio.unlock();
        this.addXP(EXP.task);
      }
    });
    this.renderHUD();
  }

  // --------------------------------------------------------------------------
  // Tương tác: kiểm tra điều kiện TRƯỚC khi đi, đi tới ô đứng, tới nơi kiểm tra lại rồi làm
  // --------------------------------------------------------------------------
  interact(o, tx, ty) {
    const k = o.kind;
    if (k === 'plot') return this.tapPlot(o);
    if (k === 'well') {
      if ((this.bag.water || 0) >= WATER_CAP) return this.warn('💧', `Túi đã đầy nước (${WATER_CAP} phần).`);
      if (!this.needEnergy(ENERGY.draw)) return;
      return this.goDo(o, () => this.drawWater());
    }
    if (k === 'house') return this.goDo(o, () => { this.learn('门'); this.changeScene('house', 6, 6, 'up'); });
    if (k === 'shop') return this.goDo(o, () => this.openMarket());
    if (k === 'pen') return this.tapPen(o);
    if (k === 'exit') return this.tapExit(o);
    if (k === 'npc') return this.goDo(o, () => this.openDialogue());
    if (k === 'bed') return this.goDo(o, () => this.askSleep());
    if (k === 'stove') return this.goDo(o, () => this.openKitchen());
    if (k === 'fridge') return this.goDo(o, () => this.openFridge());
    if (k === 'table') return this.goDo(o, () => this.openEat());
    if (k === 'decor') return this.showCard(o.word);
    if (k === 'tray') return this.tapTray(o);
    if (k === 'nest') return this.tapNest(o);
    if (k === 'animal') return this.tapAnimal(o);
    if (k === 'poop') {
      if (!this.needEnergy(ENERGY.clean)) return;
      return this.goDo(o, () => this.cleanPoop(o.idx));
    }
    if (k === 'tree') return this.tapTree(o);
    if (k === 'feeder') return this.goDo(o, () => this.openPond());
    if (k === 'pond') return this.tapPond(o, tx, ty);
    return null;
  }

  drawWater() {
    if (!this.needEnergy(ENERGY.draw)) return;
    const n = Math.min(WELL_DRAW, WATER_CAP - (this.bag.water || 0));
    if (n <= 0) return;
    this.give('water', n);
    this.useEnergy(ENERGY.draw);
    this.audio.water();
    this.actWord('打水', ` +${n}💧`);
    this.learn('水井');
  }

  // ---- luống rau (thu hoạch nhiều lứa theo Excel)
  cropNeed(p) { const c = itemOf(p.crop); return c.waits[Math.min(p.harvestNo || 0, c.waits.length - 1)]; }
  tapPlot(o) {
    const p = this.plots[o.idx];
    if (p.state === 'locked') return this.warn('🔒', `Luống này chưa mở. Lên cấp để được mua thêm luống (hiện được ${bedsAllowed(this.level)} luống).`);
    if (p.state === 'sale') {
      const bed = bedOf(o.idx);
      const price = PLOT_PRICE(bed);
      return this.goDo(o, () => this.confirm('🟫 Mua luống rau', `<p>Mua thêm 1 luống <b class="zh">菜地</b> càidì (gồm ${BED_W} ô đất) giá <b>${price}元</b>?</p>`, '买 Mua', () => {
        if (this.money < price) return this.warn('💰', `Chưa đủ tiền (cần ${price}元).`);
        this.money -= price;
        for (let c = 0; c < BED_W; c++) { const q = this.plots[bed * BED_W + c]; if (q && q.state === 'sale') q.state = 'grass'; }
        this.learn('菜地');
        this.audio.unlock();
        this.showToast('🟫', 'Đã mua luống mới (4 ô)! Dùng 锄头 cuốc từng ô rồi gieo hạt nhé.');
        this.renderHUD();
        this.markDirty();
      }));
    }
    if (p.state === 'dead') {
      // vặt xác cây héo: làm bằng tay, không cần dụng cụ
      if (!this.needEnergy(ENERGY.clear)) return;
      return this.goDo(o, () => {
        if (p.state !== 'dead' || !this.needEnergy(ENERGY.clear)) return;
        p.state = 'tilled';
        this.useEnergy(ENERGY.clear);
        this.audio.dig();
        this.learn('枯萎');
        this.actWord('清理');
        this.addXP(EXP.clear);
      });
    }
    if (p.state === 'grass') {
      if (!this.has('hoe')) return this.warn('⛏️', 'Cần 锄头 chútou (cái cuốc) — mua ở 商店.');
      if (!this.needEnergy(ENERGY.hoe)) return;
      return this.goDo(o, () => {
        if (p.state !== 'grass' || !this.needEnergy(ENERGY.hoe)) return;
        p.state = 'tilled';
        this.useEnergy(ENERGY.hoe);
        this.audio.dig();
        this.actWord('锄地');
        this.addXP(EXP.hoe);
      });
    }
    if (!p.crop) {
      const seeds = Object.keys(this.bag).filter(k => ITEMS[k].kind === 'seed');
      if (!seeds.length) return this.warn('🌱', 'Túi không có hạt giống — mua ở 商店 (cửa hàng).');
      if (!this.needEnergy(ENERGY.plant)) return;
      const plant = (sid) => this.goDo(o, () => {
        if (p.crop || !this.take(sid, 1) || !this.needEnergy(ENERGY.plant)) return;
        p.crop = ITEMS[sid].seedOf;
        p.grow = 0; p.harvestNo = 0; p.ripe = false; p.fert = false;
        p.watered = this.weather === 'rain';
        this.useEnergy(ENERGY.plant);
        this.audio.plant();
        this.learn('种子');
        this.learn(ITEMS[p.crop].chn);
        this.actWord('播种');
        this.addXP(EXP.plant);
        this.bump('plant');
      });
      if (seeds.length === 1) return plant(seeds[0]);
      return this.pick('🌱 <span class="zh">播种</span> · Chọn hạt giống', seeds.map(id => { const c = itemOf(ITEMS[id].seedOf); return { id, icon: c.icon, chn: c.chn, pin: c.pin, vi: c.vi, note: `×${this.bag[id]} · ${c.waits[0]} ngày · ${c.harvests} lứa` }; }), plant);
    }
    const c = itemOf(p.crop);
    if (p.ripe) {
      if (this.bagFree() < c.yield) return this.warn('🎒', `Túi đầy (${this.bagUsed()}/${this.bagCap()}). Cất đồ vào 冰箱 hoặc bán ở 商店.`);
      if (!this.needEnergy(ENERGY.harvest)) return;
      return this.goDo(o, () => {
        if (!p.ripe || this.bagFree() < c.yield || !this.needEnergy(ENERGY.harvest)) return;
        this.give(c.id, c.yield);
        p.harvestNo = (p.harvestNo || 0) + 1;
        p.ripe = false; p.grow = 0; p.watered = false; p.fert = false;
        const last = p.harvestNo >= c.harvests;
        if (last) { p.crop = null; p.state = 'dead'; }
        this.stats.harvests += 1;
        this.useEnergy(ENERGY.harvest);
        this.audio.harvest();
        this.learn(c.chn);
        this.learn('成熟');
        this.actWord('收获', ` +${c.yield}${c.icon.startsWith('svg:') ? '' : c.icon}`);
        if (!last) this.showToast(c.icon, `${c.chn}: lứa ${p.harvestNo}/${c.harvests}. Tiếp tục tưới, ${c.waits[p.harvestNo]} ngày nữa thu lứa sau.`);
        else this.showToast('🥀', `${c.chn} đã thu hết ${c.harvests} lứa — cây 枯萎 héo. Nhấp vào ô đó để vặt xác cây (không cần dụng cụ) rồi gieo lại.`);
        this.addXP(EXP.harvest);
        this.bump('harvest');
      });
    }
    if (p.watered) {
      if (this.has('fert') && !p.fert) {
        if (!this.needEnergy(ENERGY.fert)) return;
        return this.goDo(o, () => {
          if (p.fert || !p.crop || p.ripe || !this.take('fert', 1) || !this.needEnergy(ENERGY.fert)) return;
          p.fert = true;
          p.grow += 1;
          if (p.grow >= this.cropNeed(p)) p.ripe = true;
          this.useEnergy(ENERGY.fert);
          this.audio.plant();
          this.learn('肥料');
          this.actWord('施肥');
          this.addXP(EXP.water);
        });
      }
      return this.showToast(c.icon, `${c.chn} ${c.pin} · ${c.vi}: đã tưới hôm nay. Còn ${this.cropNeed(p) - p.grow} ngày được tưới nữa thì chín.${this.level >= 10 && !p.fert ? ' (Có 肥料 thì bón để nhanh thêm 1 ngày.)' : ''}`);
    }
    if (!this.has('can')) return this.warn('🚿', 'Cần 水壶 shuǐhú (bình tưới) — mua ở 商店.');
    if (!this.has('water')) return this.warn('💧', 'Hết nước! Ra 水井 (giếng) múc nước trước.');
    if (!this.needEnergy(ENERGY.water)) return;
    return this.goDo(o, () => {
      if (p.watered || !this.take('water', 1) || !this.needEnergy(ENERGY.water)) return;
      p.watered = true;
      this.useEnergy(ENERGY.water);
      this.audio.water();
      this.actWord('浇水');
      this.addXP(EXP.water);
      this.bump('water');
    });
  }

  // ---- chuồng
  tapPen(o) {
    const a = ANIMALS[o.animal];
    const pen = this.pens[a.id];
    if (pen.owned) return this.goDo(o, () => this.changeScene(`pen_${a.id}`, 6, 7, 'up'));
    if (this.level < a.pen.lvl) return this.warn('🔒', `${a.pen.chn} (${a.pen.vi}) mở ở cấp ${a.pen.lvl}.`);
    return this.goDo(o, () => this.confirm(`${a.icon} Mua ${a.pen.vi}`, `<p>Xây <b class="zh">${a.pen.chn}</b> ${a.pen.pin} (${a.pen.vi}) giá <b>${a.pen.cost}元</b>?</p><p class="farm-note">Mua chuồng xong, vào 商店 mua ${a.vi.toLowerCase()} (tối đa ${MAX_PER_PEN} con).</p>`, '买 Mua', () => {
      if (this.money < a.pen.cost) return this.warn('💰', `Chưa đủ tiền (cần ${a.pen.cost}元).`);
      this.money -= a.pen.cost;
      pen.owned = true;
      this.learn(a.pen.chn);
      this.audio.unlock();
      this.showToast(a.icon, `Đã xây ${a.pen.chn}! Vào 商店 mua ${a.vi.toLowerCase()} nhé.`);
      this.rebuild();
      this.renderHUD();
      this.markDirty();
    }));
  }
  tapExit(o) {
    if (o.to === 'forest') {
      if (this.level < BACKYARD_LVL) return this.warn('🔒', `后院 (vườn sau nhà: vườn cây ăn quả & ao cá) mở ở cấp ${BACKYARD_LVL}.`);
      return this.goDo(o, () => this.changeScene('forest', 11, 1, 'down'));
    }
    return this.goDo(o, () => {
      const from = this.sceneId;
      if (from === 'house') this.changeScene('farm', 3, 5, 'down');
      else if (from === 'forest') this.changeScene('farm', 1, 15, 'right');
      else { const a = SCENES[from].animal; const [dx, dy] = PEN_DOOR(a); this.changeScene('farm', dx, dy, 'down'); }
    });
  }
  penHere() { const a = SCENES[this.sceneId].animal; return a ? { a: ANIMALS[a], pen: this.pens[a] } : null; }
  tapTray(o) {
    const { a, pen } = this.penHere();
    if (o.slot >= pen.animals.length) return this.warn(a.icon, `Máng này chưa có ${a.vi.toLowerCase()}. Mua thêm ở 商店.`);
    const isFood = o.tray === 'food';
    const arr = isFood ? pen.food : pen.water;
    if (arr[o.slot]) return this.showToast(isFood ? '🍽️' : '💧', `${isFood ? '食槽 máng thức ăn' : '水槽 máng nước'} số ${o.slot + 1} đã đầy cho hôm nay.`);
    const need = isFood ? 'feed' : 'water';
    if (!this.has(need)) return this.warn(isFood ? '🌾' : '💧', isFood ? 'Túi hết 饲料 (thức ăn chăn nuôi) — mua ở 商店.' : 'Túi hết nước — ra 水井 múc nước.');
    if (!this.needEnergy(ENERGY.fill)) return;
    return this.goDo(o, () => {
      if (arr[o.slot] || !this.take(need, 1) || !this.needEnergy(ENERGY.fill)) return;
      arr[o.slot] = true;
      this.useEnergy(ENERGY.fill);
      if (a.id === 'chicken') this.audio.cluck(); else this.audio.pop();
      this.learn(isFood ? '食槽' : '水槽');
      this.learn(itemOf(need).chn);
      this.actWord(isFood ? '喂' : '加水');
      this.addXP(EXP.fill);
      this.bump('feed');
    });
  }
  tapNest(o) {
    const pen = this.pens.chicken;
    if (!pen.nests[o.slot]) return this.showToast('🪺', `鸡窝 jīwō (ổ gà) số ${o.slot + 1} chưa có trứng. Gà được ăn & uống đủ hôm nay thì sáng mai đẻ trứng.`);
    if (this.bagFree() < 1) return this.warn('🎒', 'Túi đầy — cất bớt vào 冰箱.');
    return this.goDo(o, () => {
      if (!pen.nests[o.slot] || this.bagFree() < 1) return;
      pen.nests[o.slot] = false;
      this.give('egg', 1);
      this.stats.eggs += 1;
      this.audio.harvest();
      this.learn('鸡蛋');
      this.learn('鸡窝');
      this.actWord('捡鸡蛋', ' +1🥚');
      this.addXP(EXP.egg);
      this.bump('eggs');
    });
  }
  tapAnimal(o) {
    const { a, pen } = this.penHere();
    const an = pen.animals[o.slot];
    if (!an) return;
    this.learn(a.chn);
    if (an.ready && a.product) {
      const prod = itemOf(a.product);
      if (this.bagFree() < 1) return this.warn('🎒', 'Túi đầy — cất bớt vào 冰箱.');
      if (!this.needEnergy(ENERGY.collect)) return;
      return this.goDo(o, () => {
        if (!an.ready || this.bagFree() < 1 || !this.needEnergy(ENERGY.collect)) return;
        an.ready = false;
        this.give(prod.id, 1);
        this.useEnergy(ENERGY.collect);
        this.audio.harvest();
        this.learn(prod.chn);
        this.actWord(prod.chn, ' +1');
        this.addXP(EXP.collect);
      });
    }
    if (a.id === 'pig' && pigGrown(an)) {
      if (this.bagFree() < PIG_MEAT) return this.warn('🎒', `Túi cần trống ${PIG_MEAT} chỗ để nhận thịt — cất bớt vào 冰箱.`);
      if (!this.needEnergy(ENERGY.collect)) return;
      return this.goDo(o, () => this.confirm('🥩 Thu hoạch thịt heo', `<p>Thu hoạch <b class="zh">猪肉</b> zhūròu (thịt heo) từ con heo số ${o.slot + 1}? Bạn nhận <b>${PIG_MEAT} miếng thịt</b> 🥩 và con heo này không còn trong chuồng.</p>`, '收肉 Thu hoạch', () => this.harvestPig(o.slot)));
    }
    const fed = pen.food[o.slot] && pen.water[o.slot];
    const extra = a.id === 'pig' ? ` · lớn ${Math.min(an.growth, a.growDays)}/${a.growDays} ngày`
      : a.product ? ` · ${itemOf(a.product).chn} sau ${Math.max(0, a.cycle - an.prog)} ngày được chăm` : '';
    this.say(a.chn);
    this.showToast(a.icon, `${a.chn} ${a.pin} · ${a.vi} số ${o.slot + 1}: ${an.health >= 70 ? '健康 khỏe' : an.health >= 40 ? 'hơi yếu' : '🤒 ốm — cho ăn, uống, dọn chuồng'} (${an.health}%) · hôm nay ${fed ? 'đã no' : '饿 còn đói/khát'}${extra}`);
    return null;
  }
  harvestPig(slot) {
    const here = this.penHere();
    if (!here) return;
    const { a, pen } = here;
    const an = pen.animals[slot];
    if (!an || a.id !== 'pig' || !pigGrown(an) || this.bagFree() < PIG_MEAT || !this.needEnergy(ENERGY.collect)) return;
    pen.animals.splice(slot, 1);
    pen.food.splice(slot, 1); pen.food.push(false);
    pen.water.splice(slot, 1); pen.water.push(false);
    this.give('pork', PIG_MEAT);
    this.useEnergy(ENERGY.collect);
    this.audio.harvest();
    this.learn('猪'); this.learn('猪肉');
    this.actWord('猪肉', ` +${PIG_MEAT}🥩`);
    this.addXP(EXP.collect);
    this.rebuild();
    this.renderHUD();
    this.markDirty();
  }
  cleanPoop(idx) {
    const { pen } = this.penHere();
    if (!pen.poops[idx] || !this.needEnergy(ENERGY.clean)) return;
    pen.poops.splice(idx, 1);
    this.stats.cleaned += 1;
    this.useEnergy(ENERGY.clean);
    this.audio.pop();
    this.learn('粪便');
    this.actWord('打扫');
    this.rebuild();
    this.addXP(EXP.clean);
    this.bump('clean');
  }

  // ---- vườn sau: cây ăn quả & ao cá
  tapTree(o) {
    const tr = this.trees[o.idx];
    if (!tr) {
      const saps = Object.keys(this.bag).filter(k => ITEMS[k].kind === 'sapling');
      if (!saps.length) return this.warn('🌱', 'Túi không có 树苗 (cây giống) — mua ở 商店.');
      if (!this.needEnergy(ENERGY.tree)) return;
      const plant = (sid) => this.goDo(o, () => {
        if (this.trees[o.idx] || !this.take(sid, 1) || !this.needEnergy(ENERGY.tree)) return;
        this.trees[o.idx] = { sp: ITEMS[sid].sapOf, grow: 0, prog: 0, watered: this.weather === 'rain', ripe: false };
        this.stats.trees += 1;
        this.useEnergy(ENERGY.tree);
        this.audio.plant();
        this.learn('树苗');
        this.learn('果树');
        this.actWord('播种');
        this.addXP(EXP.tree);
      });
      if (saps.length === 1) return plant(saps[0]);
      return this.pick('🌱 Chọn cây giống', saps.map(id => { const f = itemOf(ITEMS[id].sapOf); return { id, icon: f.icon, chn: ITEMS[id].chn, pin: ITEMS[id].pin, vi: ITEMS[id].vi, note: `×${this.bag[id]}` }; }), plant);
    }
    const f = itemOf(tr.sp);
    if (tr.ripe) {
      if (this.bagFree() < f.yield) return this.warn('🎒', 'Túi đầy — cất bớt vào 冰箱.');
      if (!this.needEnergy(ENERGY.harvest)) return;
      return this.goDo(o, () => {
        if (!tr.ripe || this.bagFree() < f.yield || !this.needEnergy(ENERGY.harvest)) return;
        tr.ripe = false; tr.prog = 0;
        this.give(f.id, f.yield);
        this.useEnergy(ENERGY.harvest);
        this.audio.harvest();
        this.learn(f.chn);
        this.learn('水果');
        this.actWord('收获', ` +${f.yield}${f.icon}`);
        this.addXP(EXP.fruit);
        this.bump('harvest');
      });
    }
    if (tr.watered) return this.showToast(f.icon, `${f.chn}树: đã tưới hôm nay. ${tr.grow < f.grow ? `Còn ${f.grow - tr.grow} ngày tưới nữa thì trưởng thành.` : `Còn ${f.regrow - tr.prog} ngày tưới nữa thì có quả.`}`);
    if (!this.has('can')) return this.warn('🚿', 'Cần 水壶 (bình tưới).');
    if (!this.has('water')) return this.warn('💧', 'Hết nước! Về 水井 (giếng) ở nông trại múc nước.');
    if (!this.needEnergy(ENERGY.water)) return;
    return this.goDo(o, () => {
      if (tr.watered || !this.take('water', 1) || !this.needEnergy(ENERGY.water)) return;
      tr.watered = true;
      this.useEnergy(ENERGY.water);
      this.audio.water();
      this.actWord('浇水');
      this.addXP(EXP.water);
      this.bump('water');
    });
  }
  matureFish() { return this.pond.fish.filter(f => { const s = itemOf(f.sp); return s && f.age >= s.days; }); }
  tapPond(o, tx, ty) {
    if (!this.has('rod')) return this.warn('🎣', `Cần 鱼竿 yúgān (cần câu, cấp ${ITEMS.rod.lvl}) — mua ở 商店.`);
    if (!this.has('bait')) return this.warn('🪱', `Hết 鱼饵 yú'ěr (mồi câu, cấp ${ITEMS.bait.lvl}) — mua ở 商店.`);
    if (!this.pond.fish.length) return this.warn('🐟', 'Ao chưa có cá. Mua 鱼苗 (cá giống) ở 商店 rồi thả ở bảng 鱼塘.');
    if (!this.matureFish().length) return this.warn('🐟', 'Chưa có con nào đủ lớn. Cho cá ăn mỗi ngày ở bảng 鱼塘.');
    if (this.bagFree() < 1) return this.warn('🎒', 'Túi đầy — cất bớt vào 冰箱.');
    if (!this.needEnergy(ENERGY.fish)) return;
    return this.goDo(o, () => this.startFishing(), tx, ty);
  }

  // --------------------------------------------------------------------------
  // Ngày mới: nhiệm vụ, mẫu câu, NPC
  // --------------------------------------------------------------------------
  animalsTotal() { return ANIMAL_IDS.reduce((s, k) => s + this.animalCount(k), 0); }
  makeTasks() {
    const out = [];
    const growing = this.plots.filter(p => p.crop && !p.ripe).length + this.trees.filter(t => t && !t.ripe).length;
    const ripe = this.plots.filter(p => p.ripe).length + this.trees.filter(t => t && t.ripe).length;
    const eggs = this.pens.chicken.nests.filter(Boolean).length;
    const poops = ANIMAL_IDS.reduce((s, k) => s + (this.pens[k].owned ? this.pens[k].poops.length : 0), 0);
    const empty = this.plots.filter(p => (p.state === 'tilled' && !p.crop) || p.state === 'grass').length;
    const T = (key, need, zh, pin, vi) => ({ key, need, zh, pin, vi, done: false });
    if (ripe) out.push(T('harvest', ripe, '收获成熟的菜', 'shōuhuò chéngshú de cài', `Thu hoạch ${ripe} ô/cây đã chín ✨`));
    if (growing && this.weather !== 'rain') out.push(T('water', growing, '给菜浇水', 'gěi cài jiāoshuǐ', `Tưới ${growing} ô/cây đang lớn`));
    if (this.animalsTotal()) out.push(T('feed', this.animalsTotal() * 2, '喂动物、加水', 'wèi dòngwù, jiā shuǐ', `Cho ${this.animalsTotal()} con vật ăn & uống (${this.animalsTotal() * 2} máng)`));
    if (eggs) out.push(T('eggs', eggs, '捡鸡蛋', 'jiǎn jīdàn', `Nhặt ${eggs} quả trứng trong 鸡窝`));
    if (poops) out.push(T('clean', poops, '打扫鸡舍', 'dǎsǎo jīshè', `Dọn ${poops} chỗ phân trong chuồng`));
    if (empty && Object.keys(this.bag).some(k => ITEMS[k].kind === 'seed')) out.push(T('plant', 1, '播种', 'bōzhǒng', 'Gieo hạt vào 1 ô đất trống'));
    if (this.npc) out.push(T('talk', 1, '和客人聊天', 'hé kèrén liáotiān', 'Trò chuyện với khách ở lối vào'));
    out.push(T('sell', 3, '卖东西', 'mài dōngxi', 'Bán 3 món nông sản ở 商店'));
    if (this.day % 2 === 0) out.push(T('cook', 1, '做饭', 'zuòfàn', 'Nấu 1 món ăn trong bếp'));
    return out.slice(0, 5);
  }
  pickSentences() {
    const topics = new Set(['Sinh hoạt nông trại']);
    (this.tasks || []).forEach(tk => {
      const m = { water: 'Tưới nước', harvest: 'Trồng rau', plant: 'Trồng rau', feed: this.animalCount('chicken') && !this.animalCount('pig') ? 'Chăm gà' : 'Chăm heo, cừu, bò', eggs: 'Chăm gà', clean: 'Chăm gà', sell: 'Mua bán', cook: 'Nấu ăn, năng lượng', talk: 'Sinh hoạt nông trại' }[tk.key];
      if (m) topics.add(m);
    });
    topics.add('Thời gian, thời tiết');
    if (this.level >= BACKYARD_LVL) { topics.add('Vườn cây ăn quả'); topics.add('Ao cá, câu cá'); }
    const pool = SENTENCES.filter(s => topics.has(s.topic));
    const unseen = pool.filter(s => !this.sentSeen.has(s.i));
    const src = unseen.length >= 3 ? unseen : pool;
    const picked = [];
    // ưu tiên câu ngắn → vừa → dài, câu thời tiết đúng với hôm nay
    const wTag = { rain: '下雨', sunny: '晴天', cloudy: '阴' }[this.weather];
    const wx = src.find(s => s.zh.includes(wTag));
    if (wx) picked.push(wx);
    const order = ['Ngắn', 'Vừa', 'Dài'];
    for (const len of order) { const c = src.filter(s => s.len === len && !picked.includes(s)); if (c.length && picked.length < 3) picked.push(pickOne(c)); }
    while (picked.length < 3) { const c = pickOne(src.filter(s => !picked.includes(s))); if (!c) break; picked.push(c); }
    return picked.map(s => s.i);
  }
  startDay() {
    this.today = {};
    this.npc = Math.random() < 0.55 ? this.makeNpc() : null;
    this.tasks = this.makeTasks();
    this.todaySent = this.pickSentences();
    this.todaySent.forEach(i => this.sentSeen.add(i));
  }
  tomorrowList() {
    const L2 = [];
    let ripeTmr = 0;
    let water = 0;
    this.plots.forEach(p => { if (p.crop && !p.ripe) { if (p.watered && p.grow + 1 >= this.cropNeed(p)) ripeTmr += 1; else water += 1; } });
    const dead = this.plots.filter(p => p.state === 'dead').length;
    const empty = this.plots.filter(p => (p.state === 'tilled' && !p.crop) || p.state === 'grass').length;
    const chickensFed = this.pens.chicken.animals.filter((_, i) => this.pens.chicken.food[i] && this.pens.chicken.water[i]).length;
    if (ripeTmr) L2.push(`✨ Thu hoạch ${ripeTmr} ô rau sẽ chín`);
    if (water) L2.push(`💧 Tưới ${water} ô rau đang lớn (trừ khi trời mưa)`);
    if (this.animalsTotal()) L2.push(`🌾 Cho ${this.animalsTotal()} con vật ăn & thêm nước — mua đủ 饲料, múc đủ nước`);
    if (chickensFed) L2.push(`🥚 Nhặt khoảng ${chickensFed} quả trứng`);
    L2.push('🧹 Dọn phân trong chuồng (nếu có)');
    if (dead) L2.push(`🥀 Vặt xác ${dead} ô cây héo rồi gieo lại`);
    if (empty) L2.push(`🌱 Gieo hạt vào ${empty} ô đất trống`);
    return L2;
  }

  askSleep() {
    this.learn('床');
    this.learn('明天');
    const tm = this.tomorrowList();
    const doneN = (this.tasks || []).filter(t => t.done).length;
    this.confirm('🛏️ <span class="zh">睡觉</span> · Đi ngủ', `<p>Đi ngủ và chuyển sang <b>第${this.day + 1}天</b>? Hôm nay xong <b>${doneN}/${(this.tasks || []).length}</b> nhiệm vụ.</p>
      <h4 class="tm-title">📋 <span class="zh">明天要做的事</span> · Nhiệm vụ cần làm ngày mai</h4><ul class="tm-list">${tm.map(x => `<li>${x}</li>`).join('')}</ul>
      <p class="farm-note">Khay ăn/nước trong chuồng sẽ hết khi sang ngày; đồ trong túi được giữ nguyên.</p>`, '睡觉 Ngủ', () => this.sleepFade());
  }
  sleepFade() {
    const fade = this.$('sleep-fade');
    this.sleeping = true;
    this.audio.sleep();
    this.audio.setRain(false);
    if (!fade) { this.sleep(); this.sleeping = false; return; }
    fade.className = 'sleep-fade dark';
    setTimeout(() => {
      this.sleep();
      fade.className = 'sleep-fade dark dawn';
      setTimeout(() => {
        fade.className = 'sleep-fade';
        this.audio.rooster();
        setTimeout(() => { this.sleeping = false; this.openModal('modal-day'); this.say(`早上好！第${this.day}天，今天${WEATHERS[this.weather].chn}。`); }, 1300);
      }, 1500);
    }, 2400);
  }
  sleep() {
    const sum = [];
    let grown = 0;
    let ripe = 0;
    this.plots.forEach(p => {
      if (p.crop && !p.ripe && p.watered) { p.grow += 1; grown += 1; if (p.grow >= this.cropNeed(p)) { p.ripe = true; ripe += 1; } }
      p.watered = false;
      p.fert = false;
    });
    if (grown) sum.push(`🌱 ${grown} ô rau lớn thêm${ripe ? `, <b>${ripe} ô đã chín</b> ✨` : ''}.`);
    let fruits = 0;
    this.trees.forEach(tr => {
      if (!tr) return;
      const f = itemOf(tr.sp);
      if (tr.watered && !tr.ripe) {
        if (tr.grow < f.grow) tr.grow += 1;
        else { tr.prog += 1; if (tr.prog >= f.regrow) { tr.ripe = true; fruits += 1; } }
      }
      tr.watered = false;
    });
    if (fruits) sum.push(`🍎 ${fruits} cây ăn quả có quả chín.`);
    ANIMAL_IDS.forEach(id => {
      const a = ANIMALS[id];
      const pen = this.pens[id];
      if (!pen.owned || !pen.animals.length) return;
      let fedN = 0;
      let made = 0;
      pen.animals.forEach((an, i) => {
        const fed = pen.food[i] && pen.water[i];
        if (fed) { fedN += 1; an.health = clamp(an.health + 10, 0, 100); an.growth += 1; if (a.cycle) an.prog += 1; } else an.health = clamp(an.health - 20, 0, 100);
        an.health = clamp(an.health - 5 * pen.poops.length, 0, 100);
        if (a.cycle && fed && an.health >= 40 && an.prog >= a.cycle) {
          an.prog = 0;
          if (id === 'chicken') { if (!pen.nests[i]) { pen.nests[i] = true; made += 1; } } else if (!an.ready) { an.ready = true; made += 1; }
        }
      });
      pen.food = pen.food.map(() => false);
      pen.water = pen.water.map(() => false);
      pen.animals.forEach(() => {
        if (Math.random() < 0.5 && pen.poops.length < 8) {
          const spots = [];
          for (let y = 3; y <= 6; y++) for (let x = 3; x <= 9; x++) if (!pen.poops.some(p => p[0] === x && p[1] === y) && !(id !== 'chicken' && ANIMAL_SPOTS.some(s => s[0] === x && s[1] === y))) spots.push([x, y]);
          const s = pickOne(spots);
          if (s) pen.poops.push(s);
        }
      });
      const sick = pen.animals.filter(an => an.health < 40).length;
      sum.push(`${a.icon} ${a.pen.chn}: ${fedN}/${pen.animals.length} con được chăm đủ${made && a.product ? ` · có <b>${made} ${itemOf(a.product).chn}</b>` : ''}${sick ? ` · <span class="bad">${sick} con 🤒 yếu</span>` : ''}${pen.poops.length ? ` · ${pen.poops.length} chỗ phân cần dọn` : ''}.`);
    });
    if (this.pond.fish.length) {
      if (this.pond.fedToday) { this.pond.fish.forEach(f => { f.age += 1; }); sum.push(`🐟 Cá trong ao lớn thêm 1 ngày (${this.matureFish().length} con câu được).`); } else sum.push('🐟 Hôm qua cá chưa được cho ăn nên không lớn.');
      this.pond.fedToday = false;
    }
    this.records.push({ day: this.day, earnings: this.dayIncome, date: new Date().toLocaleDateString('vi-VN') });
    if (this.cloud.loggedIn) this.pushDayResult();
    this.day += 1;
    this.dayIncome = 0;
    this.weather = rollWeather();
    this.energy = ENERGY_MAX;
    const w = WEATHERS[this.weather];
    if (this.weather === 'rain') {
      this.plots.forEach(p => { if (p.crop && !p.ripe) p.watered = true; });
      this.trees.forEach(tr => { if (tr && !tr.ripe) tr.watered = true; });
    }
    this.startDay();
    this.sceneId = 'house';
    this.walk = null;
    this.rebuild();
    this.player = { x: 3, y: 2, face: 'left' };
    this.dogPos = { x: 4, y: 3 };
    ['睡觉', '天', '天气', w.chn].forEach(x => this.learn(x));
    this.saveNow(true);
    this.renderHUD();
    const S = (i) => SENTENCES[i];
    const box = this.$('day-body');
    if (box) box.innerHTML = `
      <div class="day-big"><span class="zh">第${this.day}天</span> · Ngày ${this.day} <small>⭐ Cấp ${this.level}</small></div>
      <div class="day-weather">${w.icon} ${this.wordLine({ zh: `今天${w.chn}`, pin: `Jīntiān ${w.pin}`, vi: `Hôm nay ${w.vi}` })}<small>${w.note}</small></div>
      <div class="day-energy">⚡ Năng lượng hồi đầy <b>${ENERGY_MAX}/${ENERGY_MAX}</b> · 💰 ${this.money}元</div>
      <ul class="day-sum">${sum.map(s => `<li>${s}</li>`).join('') || '<li>Một đêm yên bình.</li>'}</ul>
      <h4 class="tm-title">📋 <span class="zh">今天的任务</span> · Nhiệm vụ hôm nay</h4>
      <ul class="task-list">${this.tasks.map(tk => `<li><b class="zh">${tk.zh}</b> <small>${tk.pin}</small> — ${tk.vi}</li>`).join('')}</ul>
      <h4 class="tm-title">📝 <span class="zh">今天的句子</span> · Mẫu câu hôm nay</h4>
      <div class="sent-list">${this.todaySent.map(i => `<div class="sent">${this.wordLine(S(i))}<em>${escapeHtml(S(i).topic)}</em></div>`).join('')}</div>
      ${this.npc ? `<p class="farm-note">💬 Có <b class="zh">${this.npcWho().chn}</b> (${this.npcWho().vi}) đang đợi ở lối vào nông trại.</p>` : ''}`;
  }
  async pushDayResult() {
    const sold = Math.max(1, Math.min(1000000, this.stats.sold));
    const r = { day: this.day, earnings: this.stats.income, served: sold, total: sold, lost: 0, avg: 100, stars: Math.min(3, Math.floor(this.level / 15)) };
    try {
      const res = await GameCloud.post({ dayResult: r, save: this.snapshot() });
      if (res && res.best) this.cloud.best = res.best;
      if (res && Array.isArray(res.history)) this.cloud.history = res.history;
    } catch (e) {}
  }


  // --------------------------------------------------------------------------
  // Hộp thoại dùng chung: xác nhận, chọn, thẻ từ vựng
  // --------------------------------------------------------------------------
  confirm(title, html, okLabel, onOk) {
    this.$('cf-title').innerHTML = title;
    this.$('cf-body').innerHTML = html;
    this.$('cf-ok').innerHTML = okLabel;
    this._cfOk = onOk;
    this.openModal('modal-confirm');
  }
  pick(title, options, onPick) {
    this.$('pk-title').innerHTML = title;
    this.$('pk-grid').innerHTML = options.map(o => `<button type="button" class="pk-opt" data-pk="${o.id}">${iconHtml(o.icon, 'big')}<b class="zh">${escapeHtml(o.chn)}</b>${this.showPinyin ? `<small class="pin">${escapeHtml(o.pin)}</small>` : ''}<small>${escapeHtml(o.vi)}</small>${o.note ? `<em>${escapeHtml(o.note)}</em>` : ''}</button>`).join('');
    this._pkFn = onPick;
    this.openModal('modal-pick');
  }
  showCard(chn, extra = '') {
    const w = wordOf(chn);
    if (!w) return;
    this.learn(chn);
    const it = Object.values(ITEMS).find(i => i.chn === chn);
    this.$('card-body').innerHTML = `
      <div class="card-icon">${it ? iconHtml(it.icon, 'huge') : '📖'}</div>
      <div class="card-zh zh">${escapeHtml(chn)}</div>
      <div class="card-pin">${escapeHtml(w.pin)}</div>
      <div class="card-vi">${escapeHtml(w.vi)}</div>
      ${extra ? `<div class="card-extra">${extra}</div>` : ''}
      <button type="button" class="g-btn-primary" data-say-chn="${escapeHtml(chn)}"><i class="fa-solid fa-volume-high"></i> Nghe phát âm</button>`;
    this.openModal('modal-card');
    this.audio.speak(chn);
  }
  inspectAt(o, tx, ty) {
    if (o) {
      let w = o.word;
      if (o.kind === 'plot' && this.plots[o.idx].crop) w = itemOf(this.plots[o.idx].crop).chn;
      if (o.kind === 'tree' && this.trees[o.idx]) w = itemOf(this.trees[o.idx].sp).chn;
      if (o.kind === 'npc') w = this.npcWho().chn;
      if (o.kind === 'pen') w = ANIMALS[o.animal].pen.chn;
      return this.showCard(w);
    }
    const ch = this.scene.base[ty][tx];
    const map = { g: '草地', x: '花', p: '小路', t: '树', b: '树', W: '水', f: '房子', w: '房子', d: SCENES[this.sceneId].chn };
    this.showCard(map[ch] || '农场');
  }



  // --------------------------------------------------------------------------
  // Cửa hàng 商店 (một cửa hàng, nhiều quầy)
  // --------------------------------------------------------------------------
  openMarket(tab) {
    this.boothTab = tab || this.boothTab || 'seed';
    this.boothSub = 'buy';
    this.boothTalk = null;
    this.learn('商店');
    this.renderMarket();
    this.openModal('modal-market');
    this.say('欢迎光临！你想买什么？');
  }
  renderMarket() {
    const TABS = [['seed', '种子', 'Hạt giống'], ['animal', '动物', 'Động vật'], ['feed', '饲料', 'Thức ăn'], ['tool', '工具', 'Dụng cụ'], ['decor', '装饰', 'Trang trí'], ['sell', '收购', 'Bán hàng']];
    this.$('mk-title').innerHTML = '🏪 <span class="zh">商店</span> · Cửa hàng';
    this.$('mk-money').textContent = `${this.money}元`;
    this.$('mk-bag').textContent = `${this.bagUsed()}/${this.bagCap()}`;
    const talk = this.boothTalk || { zh: '欢迎光临！你想买什么？', pin: 'Huānyíng guānglín! Nǐ xiǎng mǎi shénme?', vi: 'Chào mừng quý khách! Bạn muốn mua gì?' };
    this.$('mk-talk').innerHTML = `<span class="mk-face">🧑‍🌾</span>${this.wordLine(talk)}`;
    const tabs = this.$('mk-tabs');
    tabs.hidden = false;
    tabs.innerHTML = TABS.map(([k, zh, vi]) => `<button type="button" class="vocab-tab ${this.boothTab === k ? 'active' : ''}" data-mtab="${k}"><span class="zh">${zh}</span> ${vi}</button>`).join('');
    const grid = this.$('mk-grid');
    const card = (o) => `<div class="mk-item ${o.locked ? 'locked' : ''}">
        <span class="mi-ico">${iconHtml(o.icon, 'big')}</span>
        <b class="zh">${escapeHtml(o.chn)}</b>${this.showPinyin ? `<small class="pin">${escapeHtml(o.pin)}</small>` : ''}<small>${escapeHtml(o.vi)}</small>
        <span class="mi-price">${o.price}</span>
        <span class="mi-btns">${o.locked ? `<em>🔒 Cấp ${o.lvl}</em>` : o.btns}</span></div>`;
    const lock = (lvl) => this.level < lvl;
    const t = this.boothTab;
    if (t === 'animal') {
      const rows = ANIMAL_IDS.map(id => {
        const a = ANIMALS[id];
        const pen = this.pens[id];
        const n = this.animalCount(id);
        const locked = lock(a.lvl);
        const btns = !pen.owned ? `<em>Cần xây ${a.pen.chn} (bấm chuồng trên bản đồ)</em>` : `<button type="button" class="g-btn-chip" data-buyanimal="${id}" ${n < MAX_PER_PEN && this.money >= a.price ? '' : 'disabled'}>买 1</button>`;
        return card({ icon: a.icon, chn: a.chn, pin: a.pin, vi: `${a.vi} · ${n}/${MAX_PER_PEN} con`, price: `${a.price}元/${a.q}`, locked, lvl: a.lvl, btns });
      });
      Object.values(PETS).forEach(p => rows.push(card({ icon: p.icon, chn: p.chn, pin: p.pin, vi: `${p.vi} · thú cưng`, price: `${p.price}元`, locked: lock(p.lvl), lvl: p.lvl,
        btns: this.pets[p.id] ? '<em class="ok">✔ Đã nuôi</em>' : `<button type="button" class="g-btn-chip" data-buypet="${p.id}" ${this.money >= p.price ? '' : 'disabled'}>买</button>` })));
      ANIMAL_IDS.forEach(id => {
        const a = ANIMALS[id];
        if (id === 'pig') return;   // heo: thu hoạch thịt trong chuồng, không bán cả con
        this.pens[id].animals.forEach((an, i) => {
          const price = a.id === 'pig' && an.growth >= a.growDays ? a.sellGrown : a.sell;
          rows.push(card({ icon: a.icon, chn: `卖 ${a.chn} #${i + 1}`, pin: a.pin, vi: `bán ${a.vi.toLowerCase()}${a.id === 'pig' ? (an.growth >= a.growDays ? ' · 长大了' : ` · lớn ${an.growth}/${a.growDays}`) : ''}`, price: `${price}元`, btns: `<button type="button" class="g-btn-chip" data-sellanimal="${id}:${i}">卖</button>` }));
        });
      });
      grid.innerHTML = rows.join('');
      return;
    }
    if (t === 'decor') {
      grid.innerHTML = DECOR.map(d => card({ icon: d.icon, chn: d.chn, pin: d.pin, vi: `${d.vi} · ${d.where}`, price: `${d.price}元`, locked: lock(d.lvl), lvl: d.lvl,
        btns: this.decor.includes(d.id) ? '<em class="ok">✔ Đã đặt trong nhà</em>' : `<button type="button" class="g-btn-chip" data-buydecor="${d.id}" ${this.money >= d.price ? '' : 'disabled'}>买</button>` })).join('');
      return;
    }
    if (t === 'sell') {
      const list = Object.keys(this.bag).filter(k => SELLABLE.includes(ITEMS[k].kind));
      grid.innerHTML = list.map(k => { const it = ITEMS[k]; return card({ icon: it.icon, chn: it.chn, pin: it.pin, vi: `${it.vi} · có ${this.bag[k]}`, price: `${it.sell}元/${it.q}`, btns: `<button type="button" class="g-btn-chip" data-sell="${k}:1">卖 1</button><button type="button" class="g-btn-chip" data-sell="${k}:all">卖全部</button>` }); }).join('')
        || '<p class="farm-note">Túi chưa có rau, trái cây, cá, trứng, sữa hay lông cừu để bán. (Đồ trong 冰箱 phải lấy ra túi trước.)</p>';
      return;
    }
    let items = [];
    if (t === 'seed') items = Object.values(ITEMS).filter(i => ['seed', 'sapling', 'fry'].includes(i.kind)).sort((a, b) => a.lvl - b.lvl);
    if (t === 'feed') items = ['feed', 'fishfood', 'rice', 'oil'].map(k => ITEMS[k]);
    if (t === 'tool') items = ['hoe', 'can', 'fert', 'rod', 'bait'].map(k => ITEMS[k]);
    grid.innerHTML = items.map(it => {
      const isTool = it.kind === 'tool';
      const owned = isTool && this.has(it.id);
      const extra = it.kind === 'seed' ? ` · ${itemOf(it.seedOf).waits[0]} ngày, ${itemOf(it.seedOf).harvests} lứa` : it.id === 'basket' ? ` · túi +${BASKET_BONUS} chỗ` : it.id === 'fert' ? ' · cây lớn nhanh 1 ngày' : it.id === 'gloves' ? ' · dọn luống héo nhẹ hơn' : '';
      return card({ icon: it.kind === 'seed' ? itemOf(it.seedOf).icon : it.icon, chn: it.chn, pin: it.pin, vi: `${it.vi}${extra}${this.bag[it.id] && !isTool ? ` · có ${this.bag[it.id]}` : ''}`, price: `${it.buy}元/${it.q}`, locked: lock(it.lvl || 1), lvl: it.lvl,
        btns: owned ? '<em class="ok">✔ Đã có</em>' : isTool ? `<button type="button" class="g-btn-chip" data-buy="${it.id}:1" ${this.money >= it.buy ? '' : 'disabled'}>买</button>`
          : `<button type="button" class="g-btn-chip" data-buy="${it.id}:1" ${this.money >= it.buy ? '' : 'disabled'}>买 1</button><button type="button" class="g-btn-chip" data-buy="${it.id}:5" ${this.money >= it.buy * 5 ? '' : 'disabled'}>买 5</button>` });
    }).join('');
  }
  buyItem(id, n) {
    const it = ITEMS[id];
    if ((it.lvl || 1) > this.level) return;
    const cost = it.buy * n;
    if (this.money < cost) return this.warn('💰', `Không đủ tiền (cần ${cost}元).`);
    if (!this.canAdd(id, n)) return this.warn('🎒', it.kind === 'tool' ? 'Bạn đã có dụng cụ này rồi.' : `Túi không đủ chỗ (${this.bagUsed()}/${this.bagCap()}). Cất đồ vào 冰箱 trong nhà.`);
    this.money -= cost;
    this.give(id, n);
    this.learn(it.chn);
    this.learn('买');
    this.learn('一共');
    this.audio.coin();
    this.boothTalk = { zh: `好的，${numChn(n)}${it.q}${it.chn}，一共${cost}元。`, pin: `Hǎo de, ${n} ${it.q} ${it.pin}, yígòng ${cost} yuán.`, vi: `Được, ${n} ${it.vi}, tổng cộng ${cost} tệ.` };
    this.say(this.boothTalk.zh);
    this.renderHUD();
    this.renderMarket();
    this.markDirty();
  }
  buyAnimal(id) {
    const a = ANIMALS[id];
    const pen = this.pens[id];
    if (!pen.owned || this.animalCount(id) >= this.maxAnimals(id)) return this.warn(a.icon, `Chuồng đã đủ ${MAX_PER_PEN} con.`);
    if (this.money < a.price) return this.warn('💰', `Không đủ tiền (cần ${a.price}元).`);
    this.money -= a.price;
    pen.animals.push(newAnimal());
    this.learn(a.chn);
    this.learn('动物');
    this.audio.coin();
    this.boothTalk = { zh: `好的，一${a.q}${a.chn}，${a.price}元。`, pin: `Hǎo de, yì ${a.q} ${a.pin}, ${a.price} yuán.`, vi: `Được, một con ${a.vi.toLowerCase()}, ${a.price} tệ.` };
    this.say(this.boothTalk.zh);
    this.showToast(a.icon, `Đã mua 1 ${a.vi.toLowerCase()}! Nhớ cho ăn & uống ở ${a.pen.chn} mỗi ngày.`);
    this.renderHUD();
    this.renderMarket();
    this.markDirty();
  }
  buyPet(id) {
    const p = PETS[id];
    if (this.pets[id] || this.level < p.lvl || this.money < p.price) return;
    this.money -= p.price;
    this.pets[id] = true;
    if (id === 'dog') this.dogPos = { x: this.player.x, y: this.player.y };
    this.learn(p.chn);
    if (id === 'cat') this.learn('老鼠');
    this.audio.unlock();
    this.boothTalk = { zh: `这只${p.chn}很可爱，${p.price}元。`, pin: `Zhè zhī ${p.pin} hěn kě'ài, ${p.price} yuán.`, vi: `Con ${p.vi.toLowerCase()} này đáng yêu lắm, ${p.price} tệ.` };
    this.say(this.boothTalk.zh);
    this.showToast(p.icon, id === 'dog' ? 'Đã có 狗 chó! Chó sẽ chạy theo bạn khắp nông trại.' : 'Đã có 猫 mèo! Mèo chạy quanh nhà và đuổi bắt 老鼠 chuột.');
    this.renderHUD();
    this.renderMarket();
    this.markDirty();
  }
  buyDecor(id) {
    const d = DECOR.find(x => x.id === id);
    if (!d || this.decor.includes(id) || this.level < d.lvl || this.money < d.price) return;
    this.money -= d.price;
    this.decor.push(id);
    this.learn(d.chn);
    this.learn('装饰');
    this.audio.unlock();
    this.boothTalk = { zh: `好的，${d.chn}${d.price}元，我帮你送到家。`, pin: `Hǎo de, ${d.pin} ${d.price} yuán, wǒ bāng nǐ sòng dào jiā.`, vi: `Được, ${d.vi.toLowerCase()} ${d.price} tệ, tôi giao đến nhà giúp bạn.` };
    this.say(this.boothTalk.zh);
    this.showToast(d.icon, `${d.chn} ${d.vi} đã được đặt trong nhà (${d.where}).`);
    if (this.sceneId === 'house') this.rebuild();
    this.renderHUD();
    this.renderMarket();
    this.markDirty();
  }
  sellAnimal(id, i) {
    const a = ANIMALS[id];
    const pen = this.pens[id];
    const an = pen.animals[i];
    if (!an || id === 'pig') return;
    const price = a.id === 'pig' && an.growth >= a.growDays ? a.sellGrown : a.sell;
    this.confirm(`${a.icon} Bán ${a.vi.toLowerCase()}`, `<p>Bán ${a.vi.toLowerCase()} số ${i + 1} (con vật sống) giá <b>${price}元</b>?</p>`, '卖 Bán', () => {
      pen.animals.splice(i, 1);
      if (id === 'chicken') { pen.nests.splice(i, 1); pen.nests.push(false); }
      pen.food.splice(i, 1); pen.food.push(false);
      pen.water.splice(i, 1); pen.water.push(false);
      this.addMoney(price, 1);
      this.learn('卖');
      this.boothTalk = { zh: `这${a.q}${a.chn}我收了，给你${price}元。`, pin: `Zhè ${a.q} ${a.pin} wǒ shōu le, gěi nǐ ${price} yuán.`, vi: `Con ${a.vi.toLowerCase()} này tôi mua, đưa bạn ${price} tệ.` };
      this.say(this.boothTalk.zh);
      this.renderMarket();
      this.openModal('modal-market');
    });
  }
  sellItem(id, mode) {
    const it = ITEMS[id];
    const n = mode === 'all' ? (this.bag[id] || 0) : 1;
    if (!n || !this.take(id, n)) return;
    const total = it.sell * n;
    this.addMoney(total, n);
    this.learn('卖');
    this.learn('收购');
    this.learn(it.chn);
    this.boothTalk = { zh: `${numChn(n)}${it.q}${it.chn}，一共${total}元，给你钱。`, pin: `${n} ${it.q} ${it.pin}, yígòng ${total} yuán, gěi nǐ qián.`, vi: `${n} ${it.vi}, tổng cộng ${total} tệ, tiền của bạn đây.` };
    this.say(this.boothTalk.zh);
    this.addXP(EXP.sell);
    this.bump('sell', n);
    this.renderMarket();
  }

  // --------------------------------------------------------------------------
  // Túi đồ & tủ lạnh
  // --------------------------------------------------------------------------
  openBag() { this.audio.pop(); this.learn('背包'); this.renderBag(); this.openModal('modal-bag'); }
  renderBag() {
    this.$('bag-cap').textContent = `${this.bagUsed()}/${this.bagCap()}`;
    const keys = Object.keys(this.bag).filter(k => this.bag[k] > 0);
    const tools = keys.filter(k => ITEMS[k].kind === 'tool' || ITEMS[k].kind === 'bait');
    const water = this.bag.water || 0;
    const rest = keys.filter(k => countsInBag(ITEMS[k]));
    const cell = (k) => { const it = ITEMS[k]; return `<button type="button" class="bag-cell" data-card="${escapeHtml(it.chn)}">${iconHtml(it.icon, 'big')}<b class="zh">${escapeHtml(it.chn)}</b><small>${escapeHtml(it.vi)}</small>${it.kind === 'tool' ? '' : `<em>${this.bag[k]}</em>`}</button>`; };
    this.$('bag-body').innerHTML = `
      <div class="bag-row"><span class="bag-sec">🧰 <span class="zh">工具</span> Dụng cụ</span><div class="bag-grid">${tools.map(cell).join('') || '<p class="farm-note">Chưa có.</p>'}</div></div>
      <div class="bag-row"><span class="bag-sec">💧 <span class="zh">水</span> Nước</span><div class="water-bar"><i style="width:${(water / WATER_CAP) * 100}%"></i><b>${water}/${WATER_CAP}</b></div></div>
      <div class="bag-row"><span class="bag-sec">🎒 Đồ trong túi</span><div class="bag-grid">${rest.map(cell).join('') || '<p class="farm-note">Túi trống.</p>'}</div></div>
      <p class="farm-note">Chạm vào món đồ để xem thẻ từ vựng và nghe phát âm.</p>`;
  }
  openFridge() { this.audio.door(); this.learn('冰箱'); this.renderFridge(); this.openModal('modal-fridge'); }
  renderFridge() {
    this.$('fr-cap').textContent = `Túi ${this.bagUsed()}/${this.bagCap()} · Tủ ${this.fridgeUsed()}/${FRIDGE_CAP}`;
    const row = (k, n, dir) => { const it = ITEMS[k]; return `<div class="fr-item">${iconHtml(it.icon)}<span><b class="zh">${escapeHtml(it.chn)}</b> <small>${escapeHtml(it.vi)}</small></span><em>${n}</em><button type="button" class="g-btn-chip" data-fr="${dir}:${k}:1">${dir === 'in' ? 'Cất 1 ➜' : '⬅ Lấy 1'}</button><button type="button" class="g-btn-chip" data-fr="${dir}:${k}:all">${dir === 'in' ? 'Cất hết' : 'Lấy hết'}</button></div>`; };
    const bagKeys = Object.keys(this.bag).filter(k => countsInBag(ITEMS[k]));
    this.$('fr-bag').innerHTML = bagKeys.map(k => row(k, this.bag[k], 'in')).join('') || '<p class="farm-note">Túi trống.</p>';
    this.$('fr-fridge').innerHTML = Object.keys(this.fridge).map(k => row(k, this.fridge[k], 'out')).join('') || '<p class="farm-note">Tủ lạnh trống.</p>';
  }
  moveFridge(dir, id, mode) {
    if (dir === 'in') {
      const n = mode === 'all' ? (this.bag[id] || 0) : 1;
      const m = Math.min(n, FRIDGE_CAP - this.fridgeUsed());
      if (m <= 0) return this.warn('🧊', 'Tủ lạnh đã đầy.');
      this.take(id, m);
      this.fridge[id] = (this.fridge[id] || 0) + m;
    } else {
      const n = mode === 'all' ? (this.fridge[id] || 0) : 1;
      const m = Math.min(n, this.bagFree());
      if (m <= 0) return this.warn('🎒', 'Túi đầy.');
      this.fridge[id] -= m;
      if (!this.fridge[id]) delete this.fridge[id];
      this.give(id, m);
    }
    this.audio.pop();
    this.markDirty();
    this.renderFridge();
  }
  storeAll() {
    Object.keys(this.bag).filter(k => countsInBag(ITEMS[k]) && !['seed', 'sapling', 'fry', 'feed'].includes(ITEMS[k].kind)).forEach(k => {
      const m = Math.min(this.bag[k], FRIDGE_CAP - this.fridgeUsed());
      if (m > 0) { this.take(k, m); this.fridge[k] = (this.fridge[k] || 0) + m; }
    });
    this.audio.pop();
    this.renderFridge();
  }

  // --------------------------------------------------------------------------
  // Bếp & bàn ăn
  // --------------------------------------------------------------------------
  needOk(id, n) { return id === 'veg' ? VEG_ANY.some(v => this.stockAll(v) >= n) : this.stockAll(id) >= n; }
  openKitchen() { this.audio.pop(); this.learn('厨房'); this.learn('做饭'); this.renderKitchen(); this.openModal('modal-kitchen'); }
  renderKitchen() {
    this.$('kc-energy').textContent = `⚡ ${this.energy}/${ENERGY_MAX}`;
    this.$('kc-list').innerHTML = RECIPES.map(r => {
      const ok = Object.entries(r.need).every(([k, n]) => this.needOk(k, n));
      const need = Object.entries(r.need).map(([k, n]) => {
        const it = k === 'veg' ? { icon: '🥬', chn: '白菜/空心菜' } : ITEMS[k];
        const have = k === 'veg' ? VEG_ANY.reduce((s, v) => s + this.stockAll(v), 0) : this.stockAll(k);
        return `<span class="${have >= n ? 'ok' : 'miss'}">${iconHtml(it.icon)}<span class="zh">${it.chn}</span> ${Math.min(have, n)}/${n}</span>`;
      }).join('');
      return `<div class="rc-card"><span class="rc-ico">${r.icon}</span><div class="rc-info"><b class="zh">${r.chn}</b>${this.showPinyin ? ` <small class="pin">${escapeHtml(r.pin)}</small>` : ''} <small>${escapeHtml(r.vi)}</small><div class="rc-need">${need}</div><small>Ăn hồi ⚡ +${r.energy} · nấu tốn ⚡${ENERGY.cook}</small></div>
        <button type="button" class="g-btn-primary" data-cook="${r.id}" ${ok ? '' : 'disabled'}>做 Nấu</button></div>`;
    }).join('');
  }
  cook(id) {
    const r = RECIPES.find(x => x.id === id);
    if (!Object.entries(r.need).every(([k, n]) => this.needOk(k, n))) return this.warn('🥣', 'Chưa đủ nguyên liệu.');
    if (!this.needEnergy(ENERGY.cook)) return;
    Object.entries(r.need).forEach(([k, n]) => { if (k === 'veg') this.takeAny(VEG_ANY.find(v => this.stockAll(v) >= n), n); else this.takeAny(k, n); });
    this.useEnergy(ENERGY.cook);
    if (this.bagFree() >= 1) this.give(r.id, 1); else this.fridge[r.id] = (this.fridge[r.id] || 0) + 1;
    this.audio.harvest();
    this.learn(r.chn);
    this.learn('做饭');
    this.showToast(r.icon, `做好了！${r.chn} ${r.pin} · ${r.vi}. Mang ra 饭桌 (bàn ăn) để ăn.`);
    this.say(`${r.chn}做好了`);
    this.learn('锅'); this.learn('碗'); this.learn('筷子');
    this.addXP(EXP.cook);
    this.bump('cook');
    this.renderKitchen();
  }
  openEat() { this.audio.pop(); this.learn('饭桌'); this.learn('吃饭'); this.renderEat(); this.openModal('modal-eat'); }
  renderEat() {
    this.$('eat-energy').textContent = `⚡ ${this.energy}/${ENERGY_MAX}`;
    const dishes = RECIPES.filter(r => this.stockAll(r.id) > 0);
    this.$('eat-list').innerHTML = dishes.map(r => `<div class="rc-card"><span class="rc-ico">${r.icon}</span><div class="rc-info"><b class="zh">${r.chn}</b> <small>${escapeHtml(r.vi)}</small><small>Có ${this.stockAll(r.id)} phần · ⚡ +${r.energy}</small></div><button type="button" class="g-btn-primary" data-eat="${r.id}" ${this.energy >= ENERGY_MAX ? 'disabled' : ''}>吃 Ăn</button></div>`).join('')
      || '<p class="farm-note">Chưa có món ăn nào. Vào 厨房 (bếp) nấu 米饭, 炒鸡蛋, 青菜汤… trước nhé.</p>';
  }
  eat(id) {
    const r = RECIPES.find(x => x.id === id);
    if (this.energy >= ENERGY_MAX) return this.showToast('😋', 'Năng lượng đang đầy rồi.');
    if (!this.takeAny(id, 1)) return;
    this.energy = clamp(this.energy + r.energy, 0, ENERGY_MAX);
    this.audio.harvest();
    this.learn('吃饭');
    this.learn(r.chn);
    this.showToast(r.icon, `真好吃！Ăn ${r.chn} · năng lượng +${r.energy} → ${this.energy}.`);
    this.say('真好吃');
    this.renderHUD();
    this.renderEat();
    this.markDirty();
  }

  // --------------------------------------------------------------------------
  // Ao cá & câu cá
  // --------------------------------------------------------------------------
  openPond() { this.audio.pop(); this.learn('鱼塘'); this.renderPond(); this.openModal('modal-pond'); }
  renderPond() {
    const byS = {};
    this.pond.fish.forEach(f => { const s = FISH.find(x => x.id === f.sp); const k = f.sp; byS[k] = byS[k] || { s, n: 0, ok: 0 }; byS[k].n += 1; if (f.age >= s.days) byS[k].ok += 1; });
    const fries = Object.keys(this.bag).filter(k => ITEMS[k].kind === 'fry');
    this.$('pond-body').innerHTML = `
      <div class="pond-cap">🐟 Cá trong ao: <b>${this.pond.fish.length}/${POND_CAP}</b> · Hôm nay ${this.pond.fedToday ? '<b class="ok">đã cho ăn ✔</b>' : '<b class="bad">chưa cho ăn</b>'}</div>
      <div class="pond-fish">${Object.values(byS).map(x => `<span>${x.s.icon} <b class="zh">${x.s.chn}</b> ${x.n} con · ${x.ok} con câu được</span>`).join('') || '<p class="farm-note">Ao chưa có cá.</p>'}</div>
      <div class="pond-actions">
        <button type="button" class="g-btn-primary" id="btn-pond-feed" ${this.pond.fedToday || !this.pond.fish.length ? 'disabled' : ''}>${iconHtml('svg:sack_b')} <span class="zh">喂鱼</span> Cho cá ăn (1 鱼食 · ⚡${ENERGY.fishfeed})</button>
      </div>
      <div class="bag-sec">Thả cá giống từ túi:</div>
      <div class="pond-fry">${fries.map(k => `<button type="button" class="g-btn-chip" data-release="${k}">${iconHtml(ITEMS[k].icon)} ${ITEMS[k].chn} ×${this.bag[k]} → thả 1</button>`).join('') || '<p class="farm-note">Túi không có 鱼苗 — mua ở quầy 种子.</p>'}</div>
      <p class="farm-note">Câu cá: chạm vào mặt nước (cần 鱼竿 + 鱼饵, ⚡${ENERGY.fish}). Cá được cho ăn mỗi ngày sẽ lớn; đủ ngày mới câu được.</p>`;
  }
  feedFish() {
    if (this.pond.fedToday || !this.pond.fish.length) return;
    if (!this.has('fishfood')) return this.warn('🐟', 'Túi hết 鱼食 (thức ăn cho cá) — mua ở quầy 饲料.');
    if (!this.needEnergy(ENERGY.fishfeed)) return;
    this.take('fishfood', 1);
    this.pond.fedToday = true;
    this.useEnergy(ENERGY.fishfeed);
    this.audio.splash();
    this.learn('鱼食');
    this.actWord('喂');
    this.addXP(EXP.fishfeed);
    this.renderPond();
  }
  releaseFry(k) {
    if (this.pond.fish.length >= POND_CAP) return this.warn('🐟', `Ao đã đủ ${POND_CAP} con.`);
    if (!this.take(k, 1)) return;
    this.pond.fish.push({ sp: ITEMS[k].fryOf, age: 0 });
    this.audio.splash();
    this.learn('鱼苗');
    this.learn(itemOf(ITEMS[k].fryOf).chn);
    this.showToast('🐟', `Đã thả 1 ${ITEMS[k].chn} xuống ao.`);
    this.renderPond();
  }
  startFishing() {
    if (!this.has('rod') || !this.has('bait') || !this.matureFish().length || this.bagFree() < 1 || !this.needEnergy(ENERGY.fish)) return;
    this.take('bait', 1);
    this.useEnergy(ENERGY.fish);
    this.learn('钓鱼');
    this.learn('鱼竿');
    this.learn('鱼饵');
    this.say('钓鱼');
    this.fishState = 'wait';
    this.renderFishing();
    this.openModal('modal-fish');
    clearTimeout(this._fishT);
    this._fishT = setTimeout(() => {
      if (!this.isOpen('modal-fish')) return;
      this.fishState = 'bite';
      this.audio.splash();
      this.renderFishing();
      this._fishT = setTimeout(() => { if (this.fishState === 'bite') { this.fishState = 'miss'; this.renderFishing(); } }, 1300);
    }, randInt(1300, 3000));
  }
  pullFish() {
    if (this.fishState !== 'bite') {
      if (this.fishState === 'wait') { clearTimeout(this._fishT); this.fishState = 'early'; this.renderFishing(); }
      return;
    }
    clearTimeout(this._fishT);
    const pool = this.matureFish();
    const f = pickOne(pool);
    this.pond.fish.splice(this.pond.fish.indexOf(f), 1);
    const s = itemOf(f.sp);
    this.give(s.id, 1);
    this.stats.fishCaught += 1;
    this.fishState = 'got';
    this.fishGot = s;
    this.audio.fanfare();
    this.learn(s.chn);
    this.learn('鱼');
    this.say(`钓到了一条${s.chn}！`);
    this.renderFishing();
    this.addXP(EXP.fish);
    this.markDirty();
  }
  renderFishing() {
    const st = this.fishState;
    const s = this.fishGot;
    const msg = {
      wait: '<b>Chờ cá cắn câu…</b><small>Khi phao chìm và hiện ❗ thì bấm 拉 thật nhanh!</small>',
      bite: '<b class="bite">❗ Cá cắn câu! Bấm 拉 ngay!</b>',
      miss: '<b>Cá chạy mất rồi…</b><small>Mất 1 mồi câu. Thử lại nhé!</small>',
      early: '<b>Kéo sớm quá, cá sợ bơi đi mất!</b><small>Mất 1 mồi câu. Chờ hiện ❗ rồi hãy kéo.</small>',
      got: s ? `<b>钓到了！Câu được ${s.icon} ${s.chn}</b>${this.wordLine({ zh: `我钓到了一条${s.chn}。`, pin: `Wǒ diào dào le yì tiáo ${s.pin}.`, vi: `Tôi câu được một con ${s.vi}.` })}` : ''
    }[st];
    this.$('fish-body').innerHTML = `<div class="fish-scene ${st}"><span class="bobber">${st === 'bite' ? '💦' : '🔴'}</span></div><div class="fish-msg">${msg}</div>
      <div class="fish-btns">${st === 'wait' || st === 'bite' ? '<button type="button" class="g-btn-primary big" id="btn-fish-pull">🎣 <span class="zh">拉</span> Kéo!</button>'
        : `<button type="button" class="g-btn-ghost" data-close="modal-fish">Xong</button>${this.has('bait') && this.matureFish().length && this.energy >= ENERGY.fish && this.bagFree() > 0 ? '<button type="button" class="g-btn-primary" id="btn-fish-again">🎣 Câu tiếp</button>' : ''}`}</div>`;
  }



  // --------------------------------------------------------------------------
  // NPC & hội thoại (100 tình huống từ Excel)
  // --------------------------------------------------------------------------
  makeNpc() {
    const recent = new Set((this.npcRecent || []).slice(-30));
    const pool = NPC_DLG.filter(d => !recent.has(d.i));
    const d = pickOne(pool.length ? pool : NPC_DLG);
    this.npcRecent = [...(this.npcRecent || []), d.i].slice(-40);
    return { dlg: d.i, done: false };
  }
  openDialogue() {
    if (!this.npc || this.npc.done) return;
    const d = NPC_DLG[this.npc.dlg];
    this.learn(d.who.chn);
    this.learn('你好');
    this.dlgState = { d, step: 'ask', why: '', tries: 0 };
    this.renderDialogue();
    this.openModal('modal-talk');
    this.say(d.zh);
  }
  renderDialogue() {
    const { d, step, why, pick } = this.dlgState;
    const n = d.who;
    const head = `<div class="talk-npc"><span class="talk-face" style="background:${n.color}">${n.face}</span><div><b class="zh">${n.chn}</b> <small>${n.pin} · ${n.vi}</small><br><small class="talk-topic">${escapeHtml(d.topic)}</small></div></div>`;
    let body = `<div class="talk-bubble">${this.wordLine({ zh: d.zh, pin: d.pin, vi: d.vi })}</div>`;
    if (step === 'ask') {
      body += `${why ? `<div class="talk-why">💡 ${escapeHtml(why)}<br><small>Không sao, chọn lại nhé!</small></div>` : '<div class="talk-hint">Chọn câu đáp phù hợp nhất với lời khách nói:</div>'}
        <div class="talk-choices">${d.choices.map((c, i) => `<button type="button" class="talk-choice" data-choice="${i}"><b class="zh">${String.fromCharCode(65 + i)}. ${escapeHtml(c)}</b>${this.showPinyin ? `<small class="pin">${escapeHtml(d.pins[i])}</small>` : ''}</button>`).join('')}</div>`;
    } else {
      body += `<div class="talk-bubble me">${this.wordLine({ zh: d.choices[pick], pin: d.pins[pick], vi: 'Bạn trả lời đúng! ✅' })}</div>
        <div class="talk-paid">+${EXP.talk} EXP</div>
        <div class="talk-end"><button type="button" class="g-btn-primary" data-close="modal-talk"><span class="zh">再见</span> Tạm biệt</button></div>`;
    }
    this.$('talk-body').innerHTML = head + body;
  }
  chooseAnswer(i) {
    const st = this.dlgState;
    const d = st.d;
    if (st.step !== 'ask' || !d.choices[i]) return;
    this.audio.speak(d.choices[i]);
    if (i !== d.ok) {
      st.tries += 1;
      st.why = `Câu "${d.choices[i]}" chưa hợp với lời "${d.zh}" (${d.vi}). Gợi ý: đọc kỹ người kia đang hỏi / nói gì rồi chọn câu đáp lại đúng ý.`;
      this.audio.error();
      this.renderDialogue();
      return;
    }
    st.step = 'done';
    st.pick = i;
    this.npc.done = true;
    this.stats.talks += 1;
    ['谢谢', '再见', '欢迎', '请问', '没问题', '不客气', '不好意思'].forEach(w => { if (d.zh.includes(w) || d.choices[i].includes(w)) this.learn(w); });
    this.audio.unlock();
    this.renderDialogue();
    this.addXP(st.tries ? Math.ceil(EXP.talk / 2) : EXP.talk);
    this.bump('talk');
    this.rebuild();
    this.markDirty();
  }

  // --------------------------------------------------------------------------
  // Lên cấp, nhiệm vụ, mẫu câu, bản đồ
  // --------------------------------------------------------------------------
  showLevelUp(levels) {
    const L = levels[levels.length - 1];
    const unl = levels.flatMap(l => unlocksAt(l));
    this.$('ms-body').innerHTML = `<div class="lu-burst">⭐</div><h3><span class="zh">升级了！</span> Lên cấp ${L}</h3>
      <div class="lu-reward">💰 +${levels.reduce((s, l) => s + 10 * l, 0)}元</div>
      ${unl.length ? `<div class="ms-unlock"><b>🔓 Mở khóa:</b><ul>${unl.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>` : ''}
      <p class="farm-note">Mở khóa là được quyền mua — bạn vẫn dùng tiền để mua ở 商店.</p>`;
    this.audio.fanfare();
    this.openModal('modal-milestone');
    setTimeout(() => this.audio.speak(`升级了！${L}级！`), 400);
  }
  openTasks() {
    this.audio.pop();
    this.learn('任务');
    const S = (i) => SENTENCES[i];
    const seen = [...this.sentSeen].sort((a, b) => a - b);
    this.$('tasks-body').innerHTML = `
      <h4 class="tm-title">📋 <span class="zh">今天的任务</span> · Nhiệm vụ hôm nay (第${this.day}天)</h4>
      <ul class="task-list big">${(this.tasks || []).map(tk => { const have = Math.min(tk.need, this.today[tk.key] || 0); return `<li class="${tk.done ? 'done' : ''}"><span>${tk.done ? '✅' : '⬜'}</span><div><b class="zh">${tk.zh}</b> <small>${tk.pin}</small><br>${escapeHtml(tk.vi)}</div><em>${have}/${tk.need}</em></li>`; }).join('') || '<li>Không có nhiệm vụ.</li>'}</ul>
      <p class="farm-note">Mỗi nhiệm vụ xong: +${EXP.task} EXP, +5元.</p>
      <h4 class="tm-title">📝 <span class="zh">今天的句子</span> · Mẫu câu hôm nay</h4>
      <div class="sent-list">${(this.todaySent || []).map(i => `<div class="sent">${this.wordLine(S(i))}<em>${escapeHtml(S(i).topic)}</em></div>`).join('')}</div>
      <details class="sent-all"><summary>📚 Các mẫu câu đã học (${seen.length}/${SENTENCES.length})</summary>
        <div class="sent-list">${seen.map(i => `<div class="sent">${this.wordLine(S(i))}<em>${escapeHtml(S(i).topic)}</em></div>`).join('')}</div></details>`;
    this.openModal('modal-tasks');
  }
  openMap() {
    this.audio.pop();
    const areas = [
      { id: 'farm', open: true }, { id: 'house', open: true }, { id: 'pen_chicken', open: true },
      { id: 'pen_pig', open: this.pens.pig.owned, need: `cấp ${ANIMALS.pig.lvl} + mua chuồng` }, { id: 'pen_sheep', open: this.pens.sheep.owned, need: `cấp ${ANIMALS.sheep.lvl} + mua chuồng` }, { id: 'pen_cow', open: this.pens.cow.owned, need: `cấp ${ANIMALS.cow.lvl} + mua chuồng` },
      { id: 'forest', open: this.level >= BACKYARD_LVL, need: `cấp ${BACKYARD_LVL}` }
    ];
    this.$('map-body').innerHTML = `
      <div class="map-areas">${areas.map(a => { const s = SCENES[a.id]; return `<div class="map-area ${a.open ? '' : 'locked'} ${this.sceneId === a.id ? 'here' : ''}"><span>${s.icon}</span><b class="zh">${s.chn}</b><small>${escapeHtml(s.vi)}</small>${this.sceneId === a.id ? '<em>📍 Bạn ở đây</em>' : a.open ? '' : `<em>🔒 ${a.need}</em>`}</div>`; }).join('')}</div>
      <h4>⭐ Cấp ${this.level}${this.level >= LEVEL_MAX ? ' · MAX' : ` · ${this.xp - xpTotal(this.level)}/${xpNeed(this.level)} EXP`}</h4>
      <p class="farm-note">Làm việc trong nông trại để nhận EXP. Mỗi lần lên cấp sẽ có điều bất ngờ mới được mở khóa! 🎁</p>`;
    this.openModal('modal-map');
  }

  // --------------------------------------------------------------------------
  // Từ vựng
  // --------------------------------------------------------------------------
  openVocab() { this.audio.pop(); this.vocabTab = this.vocabTab || 'plant'; this.renderVocab(); this.openModal('modal-vocab'); }
  renderVocab() {
    const q = (this.$('vocab-search').value || '').trim().toLowerCase();
    this.$('vocab-tabs').innerHTML = VOCAB_GROUPS.map(gp => `<button type="button" class="vocab-tab ${gp.id === this.vocabTab && !q ? 'active' : ''}" data-vtab="${gp.id}"><span class="zh">${gp.chn}</span> ${gp.vi}</button>`).join('');
    const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const words = q ? Object.values(VOCAB_INDEX).filter(w => w.chn.includes(q) || plain(w.pin).replace(/\s/g, '').includes(plain(q).replace(/\s/g, '')) || w.vi.toLowerCase().includes(q))
      : VOCAB_GROUPS.find(gp => gp.id === this.vocabTab).words;
    this.$('vocab-items-grid').innerHTML = words.map(v => `
      <div class="vc ${this.learned.has(v.chn) ? 'learned' : ''}"><span class="zh">${escapeHtml(v.chn)}</span><div class="pin">${escapeHtml(v.pin)}</div><div class="vi">${escapeHtml(v.vi)}</div>
        <button type="button" data-say-chn="${escapeHtml(v.chn)}" title="Nghe phát âm"><i class="fa-solid fa-volume-high"></i></button></div>`).join('') || '<p class="farm-note">Không tìm thấy từ nào.</p>';
    this.setText('vocab-count', `Đã gặp ${this.learnedCount()}/${VOCAB_TOTAL} từ`);
  }


  // --------------------------------------------------------------------------
  // Thanh trên, màn hình chờ, sự kiện DOM
  // --------------------------------------------------------------------------
  renderHUD() {
    const w = WEATHERS[this.weather];
    this.setText('hud-day', `第${this.day}天`);
    this.setText('hud-day-vi', `Ngày ${this.day}`);
    const wc = this.$('hud-weather');
    if (wc) wc.innerHTML = `${w.icon} <span class="zh">${w.chn}</span> <small>${w.vi}</small>`;
    this.setText('hud-money', `${this.money}元`);
    this.setText('hud-energy-val', `${this.energy}/${ENERGY_MAX}`);
    const f = this.$('hud-energy-fill');
    if (f) { f.style.width = `${(this.energy / ENERGY_MAX) * 100}%`; f.classList.toggle('low', this.energy < 20); }
    this.setText('hud-vocab-val', `${this.learnedCount()}/${VOCAB_TOTAL}`);
    this.setText('hud-bag-val', `${this.bagUsed()}/${this.bagCap()}`);
    this.setText('hud-level', String(this.level));
    const need = xpNeed(this.level);
    const have = this.xp - xpTotal(this.level);
    this.setText('hud-xp', this.level >= LEVEL_MAX ? 'MAX' : `${have}/${need}`);
    const xf = this.$('hud-xp-fill');
    if (xf) xf.style.width = `${this.level >= LEVEL_MAX ? 100 : Math.min(100, (have / need) * 100)}%`;
    const tk = this.tasks || [];
    this.setText('hud-task-val', `${tk.filter(t => t.done).length}/${tk.length}`);
    const s = SCENES[this.sceneId];
    const loc = this.$('loc-chip');
    if (loc) loc.innerHTML = `${s.icon} <span class="zh">${s.chn}</span> <small>${s.vi}</small>`;
    const ins = this.$('btn-inspect');
    if (ins) ins.classList.toggle('on', this.inspect);
  }

  showTitleScreen() {
    const el = this.$('title-screen');
    if (el) el.classList.remove('hidden');
    document.body.classList.add('on-title');
    const loading = !this.cloud.checked && GameCloud.signedIn();
    const started = this.day > 1 || this.stats.harvests > 0 || this.stats.eggs > 0 || this.xp > 0;
    this.setText('title-play-vi', loading ? 'Đang tải…' : started ? `Tiếp tục · ngày ${this.day}` : 'Vào nông trại');
    const play = this.$('btn-title-play');
    if (play) play.disabled = !!loading;
    const prog = this.$('title-progress');
    if (prog) prog.innerHTML = started
      ? `<span>📅 第${this.day}天</span><span>💰 ${this.money}元</span><span>⭐ Cấp ${this.level}</span>`
      : '<span>✨ Vừa làm nông · vừa học tiếng Trung</span>';
  }
  onTitlePlay() {
    if (!this.cloud.checked && GameCloud.signedIn()) return;
    this.audio.init();
    this.audio.pop();
    const el = this.$('title-screen');
    if (el) el.classList.add('hidden');
    document.body.classList.remove('on-title');
    this.rebuild();
    this.renderHUD();
    const w = WEATHERS[this.weather];
    this.learn(w.chn);
    this.showToast(w.icon, `第${this.day}天 · ${w.chn} ${w.pin} · ${w.vi}. ${w.note}`);
    if (this.day === 1 && !this.xp) setTimeout(() => { this.openTasks(); this.showToast('👆', 'Nhấp vào vật thể (ô đất, giếng, chuồng gà…) — nhân vật sẽ tự đi tới và làm việc.'); }, 900);
    else if (this.npc && !this.npc.done) setTimeout(() => this.showToast('💬', `Có ${this.npcWho().chn} (${this.npcWho().vi}) đang đợi ở lối vào nông trại.`), 1800);
  }
  async resetGame() {
    if (!confirm('Chơi lại từ đầu? Nông trại (tiền, đất, vật nuôi, mốc phát triển) sẽ bị xóa. Kỷ lục trên bảng xếp hạng vẫn được giữ.')) return;
    LocalSave.clear(this.owner);
    if (this.cloud.loggedIn) { try { await GameCloud.post({ resetSave: true }); } catch (e) {} }
    location.reload();
  }

  initDOM() {
    const on = (id, ev, fn) => { const el = this.$(id); if (el) el.addEventListener(ev, fn); };
    window.addEventListener('resize', () => this.fitStage());
    window.addEventListener('orientationchange', () => setTimeout(() => this.fitStage(), 200));
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.saveNow(true); });
    window.addEventListener('pagehide', () => this.saveNow(true));

    on('btn-title-play', 'click', () => this.onTitlePlay());
    on('btn-title-guide', 'click', () => { this.audio.pop(); this.openModal('modal-guide'); });
    on('btn-title-rank', 'click', () => { this.audio.pop(); this.openRankModal(); });
    on('btn-hud-home', 'click', () => { this.audio.pop(); this.saveNow(true); this.showTitleScreen(); });
    on('btn-pause-game', 'click', () => { this.audio.pop(); this.openModal('modal-settings'); });
    on('btn-fullscreen', 'click', () => this.toggleFullscreen());
    on('btn-rotate-fullscreen', 'click', () => this.toggleFullscreen());
    on('btn-open-vocab', 'click', () => this.openVocab());
    on('btn-bag', 'click', () => this.openBag());
    on('btn-map', 'click', () => this.openMap());
    on('btn-tasks', 'click', () => this.openTasks());
    on('btn-level', 'click', () => this.openMap());
    on('btn-inspect', 'click', () => { this.inspect = !this.inspect; this.audio.pop(); this.renderHUD(); this.showToast('🔍', this.inspect ? 'Chế độ 识字: nhấp vào bất cứ thứ gì để xem thẻ từ vựng (không làm việc).' : 'Tắt chế độ thẻ từ — nhấp để làm việc như bình thường.'); });
    on('hud-weather', 'click', () => { const w = WEATHERS[this.weather]; this.showCard(w.chn, escapeHtml(w.note)); });
    on('btn-energy', 'click', () => this.showToast('⚡', `体力 tǐlì · năng lượng ${this.energy}/${ENERGY_MAX}. Ăn món ăn ở 饭桌 (bàn ăn trong nhà) hoặc ngủ để hồi.`));

    const cv = this.$('farm-canvas');
    if (cv) {
      cv.addEventListener('click', (e) => { const [x, y] = this.eventTile(e); this.onMapClick(x, y); });
      cv.addEventListener('mousemove', (e) => {
        const [x, y] = this.eventTile(e);
        const sc = this.scene;
        this.hover = x >= 0 && y >= 0 && x < sc.cols && y < sc.rows ? [x, y] : null;
        cv.style.cursor = this.hover && objAt(sc, x, y) ? 'pointer' : 'default';
      });
      cv.addEventListener('mouseleave', () => { this.hover = null; });
    }

    // hộp thoại dùng chung
    on('cf-ok', 'click', () => { this.closeModal('modal-confirm'); const fn = this._cfOk; this._cfOk = null; if (fn) fn(); });
    on('pk-grid', 'click', (e) => { const b = e.target.closest('[data-pk]'); if (!b) return; this.closeModal('modal-pick'); const fn = this._pkFn; this._pkFn = null; if (fn) fn(b.dataset.pk); });
    on('modal-market', 'click', (e) => {
      const t = e.target.closest('[data-mtab]');
      if (t) { this.boothTab = t.dataset.mtab; this.boothTalk = null; this.audio.pop(); this.renderMarket(); return; }
      const b = e.target.closest('[data-buy]');
      if (b && !b.disabled) { const [id, n] = b.dataset.buy.split(':'); this.buyItem(id, +n); return; }
      const s = e.target.closest('[data-sell]');
      if (s) { const [id, m] = s.dataset.sell.split(':'); this.sellItem(id, m); return; }
      const ba = e.target.closest('[data-buyanimal]');
      if (ba && !ba.disabled) { this.buyAnimal(ba.dataset.buyanimal); return; }
      const sa = e.target.closest('[data-sellanimal]');
      if (sa) { const [id, i] = sa.dataset.sellanimal.split(':'); this.sellAnimal(id, +i); return; }
      const bp = e.target.closest('[data-buypet]');
      if (bp && !bp.disabled) { this.buyPet(bp.dataset.buypet); return; }
      const bd = e.target.closest('[data-buydecor]');
      if (bd && !bd.disabled) this.buyDecor(bd.dataset.buydecor);
    });
    on('modal-bag', 'click', (e) => { const c = e.target.closest('[data-card]'); if (c) this.showCard(c.dataset.card); });
    on('modal-fridge', 'click', (e) => { const b = e.target.closest('[data-fr]'); if (b) { const [d, id, m] = b.dataset.fr.split(':'); this.moveFridge(d, id, m); } });
    on('btn-store-all', 'click', () => this.storeAll());
    on('modal-kitchen', 'click', (e) => { const b = e.target.closest('[data-cook]'); if (b && !b.disabled) this.cook(b.dataset.cook); });
    on('modal-eat', 'click', (e) => { const b = e.target.closest('[data-eat]'); if (b && !b.disabled) this.eat(b.dataset.eat); });
    on('modal-pond', 'click', (e) => {
      if (e.target.closest('#btn-pond-feed')) { this.feedFish(); return; }
      const r = e.target.closest('[data-release]');
      if (r) this.releaseFry(r.dataset.release);
    });
    on('modal-fish', 'click', (e) => {
      if (e.target.closest('#btn-fish-pull')) { this.pullFish(); return; }
      if (e.target.closest('#btn-fish-again')) { this.closeModal('modal-fish'); this.startFishing(); }
    });
    on('modal-talk', 'click', (e) => { const c = e.target.closest('[data-choice]'); if (c) this.chooseAnswer(+c.dataset.choice); });
    on('vocab-tabs', 'click', (e) => { const t = e.target.closest('[data-vtab]'); if (t) { this.vocabTab = t.dataset.vtab; this.$('vocab-search').value = ''; this.audio.pop(); this.renderVocab(); } });
    on('vocab-search', 'input', () => this.renderVocab());

    document.addEventListener('click', (e) => {
      const say = e.target.closest('[data-say-chn]');
      if (say) { this.audio.speak(say.dataset.sayChn); this.learn(say.dataset.sayChn); }
      const cl = e.target.closest('[data-close]');
      if (cl) {
        this.closeModal(cl.dataset.close);
        if (cl.dataset.close === 'modal-fish') clearTimeout(this._fishT);
        this.renderHUD();
        this.saveNow();
      }
    });
    document.querySelectorAll('.rank-tab').forEach(btn => btn.addEventListener('click', () => { this.audio.pop(); this.switchRankTab(btn.dataset.rankTab); }));

    on('setting-sfx', 'change', (e) => { this.audio.sfxEnabled = e.target.checked; });
    on('setting-voice', 'change', (e) => { this.audio.voiceEnabled = e.target.checked; });
    on('setting-autovoice', 'change', (e) => { this.autoVoice = e.target.checked; this.markDirty(); });
    on('setting-pinyin', 'change', (e) => { this.showPinyin = e.target.checked; this.markDirty(); });
    on('setting-vietnamese', 'change', (e) => { this.showVietnamese = e.target.checked; this.markDirty(); });
    on('btn-back-to-title', 'click', () => { this.closeModal('modal-settings'); this.saveNow(true); this.showTitleScreen(); });
    on('btn-reset-save', 'click', () => this.resetGame());
    this.syncSettings();
  }
  syncSettings() {
    const set = (id, v) => { const el = this.$(id); if (el) el.checked = v; };
    set('setting-pinyin', this.showPinyin);
    set('setting-vietnamese', this.showVietnamese);
    set('setting-autovoice', this.autoVoice);
  }

  fitStage() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const portrait = h > w * 1.05;
    let sw = STAGE_W;
    let sh = STAGE_H;
    if (portrait) {
      sw = PORTRAIT_W;
      sh = Math.round((PORTRAIT_W * h) / Math.max(1, w));
      if (sh < PORTRAIT_MIN_H) { sh = PORTRAIT_MIN_H; sw = Math.max(PORTRAIT_W, Math.round((PORTRAIT_MIN_H * w) / Math.max(1, h))); }
    }
    const scale = Math.min(w / sw, h / sh);
    this.stageScale = scale > 0 ? scale : 1;
    const root = document.documentElement.style;
    root.setProperty('--stage-scale', this.stageScale.toFixed(4));
    root.setProperty('--stage-w', `${sw}px`);
    root.setProperty('--stage-h', `${sh}px`);
    document.body.classList.toggle('stage-flush', portrait || (w - sw * this.stageScale < 24 && h - sh * this.stageScale < 24) || w < 900);
    this.isPortrait = portrait;
    document.body.classList.toggle('g-portrait', portrait);
  }
  toggleFullscreen() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
      else if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // Tài khoản & bảng xếp hạng (xếp theo tổng thu nhập 元)
  // --------------------------------------------------------------------------
  async initCloud() {
    let data;
    try {
      data = await GameCloud.getProgress();
    } catch (e) {
      this.cloud.checked = true;
      this.cloud.offline = true;
      const lu = GameCloud.localUser();
      if (lu) this.cloud.name = lu.name || lu.email;
      this.renderAccountChip();
      return;
    }
    this.cloud.checked = true;
    if (!data || !data.loggedIn) { this.switchOwner('guest'); this.renderAccountChip(); return; }
    const lu = GameCloud.localUser();
    this.cloud.loggedIn = true;
    this.cloud.name = (data.user && data.user.name) || (lu && lu.name) || 'Bạn';
    this.cloud.picture = (data.user && data.user.picture) || (lu && lu.picture) || '';
    this.cloud.best = data.best || null;
    this.cloud.history = Array.isArray(data.history) ? data.history : [];
    const email = lu && lu.email ? String(lu.email).toLowerCase().trim() : '';
    this.owner = email || 'account';
    const server = data.save && data.save.v === SAVE_VERSION ? data.save : null;
    const local = email ? LocalSave.read(email) : null;
    const sTime = server ? Number(server.updatedAt) || 0 : -1;
    const lTime = local ? Number(local.updatedAt) || 0 : -1;
    if (server && sTime >= lTime && this.applySnapshot(server)) { if (email) LocalSave.write(email, server); }
    else if (local && this.applySnapshot(local)) GameCloud.post({ save: local }).catch(() => {});
    else this.newFarm();
    this.syncSettings();
    this.renderHUD();
    this.renderAccountChip();
  }
  switchOwner(owner) {
    if (this.owner === owner) return;
    this.owner = owner;
    const s = LocalSave.read(owner);
    if (!(s && this.applySnapshot(s))) this.newFarm();
    this.renderHUD();
  }
  renderAccountChip() {
    const chip = this.$('title-account');
    if (!chip) return;
    const c = this.cloud;
    const avatar = this.$('title-account-avatar');
    if (c.loggedIn) {
      chip.classList.remove('guest');
      chip.removeAttribute('href');
      this.setText('title-account-name', c.name);
      this.setText('title-account-status', c.best ? `☁️ Đã lưu · Tổng thu nhập ${Math.round(c.best.earnings)}元` : '☁️ Nông trại được lưu vào tài khoản');
      if (avatar) avatar.innerHTML = c.picture ? `<img src="${escapeHtml(c.picture)}" alt="" referrerpolicy="no-referrer">` : '<i class="fa-solid fa-user"></i>';
    } else {
      chip.classList.add('guest');
      chip.setAttribute('href', 'index.html');
      this.setText('title-account-name', c.offline && c.name ? c.name : 'Khách');
      this.setText('title-account-status', c.offline ? '⚠️ Mất kết nối · lưu tạm trên máy' : 'Đăng nhập để lưu vào tài khoản');
      if (avatar) avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
    }
  }
  openRankModal(tab = this.rankTab || 'global') { this.openModal('modal-rank'); this.switchRankTab(tab); }
  switchRankTab(tab) {
    this.rankTab = tab === 'mine' ? 'mine' : 'global';
    document.querySelectorAll('.rank-tab').forEach(b => b.classList.toggle('active', b.dataset.rankTab === this.rankTab));
    if (this.rankTab === 'mine') this.renderMyRank(); else this.renderGlobalRank();
  }
  async renderGlobalRank() {
    const list = this.$('rank-list');
    const summary = this.$('rank-summary');
    if (!list || !summary) return;
    this.setText('rank-note', 'Mỗi người 1 dòng · Xếp theo tổng thu nhập (元) từ bán hàng · ghi nhận mỗi lần đi ngủ');
    summary.innerHTML = '';
    list.innerHTML = '<div class="rank-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải bảng xếp hạng...</div>';
    const req = (this.rankReq = (this.rankReq || 0) + 1);
    let data;
    try { data = await GameCloud.getLeaderboard(); } catch (e) {
      if (req !== this.rankReq || this.rankTab !== 'global') return;
      list.innerHTML = '<div class="rank-empty">📡 Không kết nối được máy chủ.<br>Kiểm tra mạng rồi thử lại nhé!<br><br><button type="button" class="g-btn-chip" id="btn-rank-retry">🔄 Thử lại</button></div>';
      this.$('btn-rank-retry')?.addEventListener('click', () => this.renderGlobalRank());
      return;
    }
    if (req !== this.rankReq || this.rankTab !== 'global') return;
    const me = data.me;
    summary.innerHTML = `
      <div class="rs-item"><span>👥</span><strong>${data.totalPlayers || 0}</strong><small>Chủ trại</small></div>
      <div class="rs-item"><span>🏅</span><strong>${me ? `#${me.rank}` : '—'}</strong><small>Hạng của bạn</small></div>
      <div class="rs-item"><span>💰</span><strong>${me ? Math.round(me.earnings) : this.stats.income}元</strong><small>Tổng thu nhập</small></div>
      <div class="rs-item"><span>📅</span><strong>${me ? me.day : this.day}</strong><small>Ngày</small></div>`;
    const cta = !data.loggedIn ? '<div class="rank-cta"><span>🔐 Bạn đang chơi với tư cách khách — đăng nhập để ghi tên lên bảng!</span><a href="index.html">Đăng nhập</a></div>' : '';
    const top = Array.isArray(data.top) ? data.top : [];
    if (!top.length) { list.innerHTML = cta + '<div class="rank-empty">🌾 Chưa có ai trên bảng xếp hạng.<br>Bán nông sản rồi đi ngủ để ghi tên đầu tiên!</div>'; return; }
    const medals = ['🥇', '🥈', '🥉'];
    const row = (r) => `
      <div class="rank-row ${r.rank <= 3 ? 'top' : ''} ${r.isMe ? 'me' : ''}">
        <span class="rr-pos">${medals[r.rank - 1] || r.rank}</span>
        <span class="rr-player">${r.picture ? `<img class="rr-avatar" src="${escapeHtml(r.picture)}" alt="" referrerpolicy="no-referrer" loading="lazy">` : '<span class="rr-avatar"><i class="fa-solid fa-user"></i></span>'}
          <span class="rr-name"><b>${escapeHtml(r.name)}${r.isMe ? '<span class="rr-me">Bạn</span>' : ''}</b><small>${r.achievedAt ? new Date(r.achievedAt).toLocaleDateString('vi-VN') : ''}</small></span></span>
        <span class="rr-earn">💰 ${Math.round(r.earnings)}元</span>
        <span>📅 Ngày ${Number(r.day) || 1}</span>
        <span>🧺 ${r.served} món đã bán</span>
        <span class="rr-stars">${'⭐'.repeat(r.stars || 0)}</span>
      </div>`;
    const meOutside = me && !top.some(r => r.isMe);
    list.innerHTML = cta + top.map(row).join('') + (meOutside ? `<div class="rank-gap">⋮</div>${row(me)}` : '');
  }
  renderMyRank() {
    const list = this.$('rank-list');
    const summary = this.$('rank-summary');
    this.setText('rank-note', this.cloud.loggedIn ? '☁️ Thu nhập từng ngày đã lưu trong tài khoản' : 'Đang lưu trên máy này · Đăng nhập để lên bảng xếp hạng');
    if (summary) summary.innerHTML = `
      <div class="rs-item"><span>📅</span><strong>${this.day}</strong><small>Ngày</small></div>
      <div class="rs-item"><span>💰</span><strong>${this.stats.income}元</strong><small>Tổng thu nhập</small></div>
      <div class="rs-item"><span>⭐</span><strong>${this.level}</strong><small>Cấp độ</small></div>
      <div class="rs-item"><span>📖</span><strong>${this.learnedCount()}</strong><small>Từ đã gặp</small></div>`;
    if (!list) return;
    const recs = [...this.records].sort((a, b) => b.day - a.day);
    list.innerHTML = !recs.length ? '<div class="rank-empty">🌾 Chưa ngủ đêm nào.<br>Làm việc rồi lên giường ngủ để ghi lại ngày đầu tiên!</div>'
      : recs.slice(0, 30).map(r => `<div class="rank-row"><span class="rr-pos">📅${r.day}</span><span class="rr-name"><b>Ngày ${r.day}</b><small>${escapeHtml(r.date || '')}</small></span><span class="rr-earn">💰 ${Math.round(r.earnings)}元</span><span></span><span></span><span></span></div>`).join('');
  }
}

(function bootFarm() {
  const start = () => { if (!window.farmGame) window.farmGame = new FarmGame(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
