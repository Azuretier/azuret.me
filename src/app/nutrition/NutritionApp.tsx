import { useState, useRef, useEffect, useCallback, CSSProperties } from "react";
import {
  type Food, type FoodLog, type Logs,
  type Exercise, type ExerciseLog,
  type Drink, type DrinkLog, type DrinkTotals,
  type HistoryEntry, type HamaSushiItem, type TondenItem,
  storage,
} from "./storage";

const FOOD_DB: Food[] = [
  // ── 主食 ──
  { id: 1, name: "白米", qty: "茶碗1杯(150g)", cal: 252, protein: 3.8, fat: 0.5, carb: 55.7, fiber: 0.5, na: 1, category: "staple", recipe: "① 米を研いで30分浸水\n② 炊飯器で通常炊飯\n③ 蒸らし10分後にほぐす" },
  { id: 2, name: "玄米", qty: "茶碗1杯(150g)", cal: 228, protein: 4.2, fat: 1.5, carb: 47.0, fiber: 2.1, na: 1, category: "staple", recipe: "① 玄米を洗い6時間以上浸水\n② 水を多めに炊飯（玄米モード）\n③ 15分蒸らしてほぐす" },
  { id: 3, name: "食パン", qty: "1枚(60g)", cal: 158, protein: 5.3, fat: 2.5, carb: 28.0, fiber: 1.3, na: 300, category: "staple" },
  { id: 4, name: "うどん（茹）", qty: "1玉(250g)", cal: 263, protein: 6.5, fat: 1.0, carb: 54.6, fiber: 1.3, na: 225, category: "staple" },
  { id: 35, name: "パスタ（茹）", qty: "1人前(250g)", cal: 373, protein: 13.0, fat: 2.3, carb: 71.3, fiber: 4.3, na: 3, category: "staple" },
  { id: 26, name: "コーンフレーク", qty: "1杯(40g)", cal: 152, protein: 2.8, fat: 0.4, carb: 34.6, fiber: 0.9, na: 260, category: "staple" },
  { id: 24, name: "鮭おにぎり", qty: "1個(110g)", cal: 201, protein: 6.2, fat: 2.0, carb: 39.2, fiber: 0.5, na: 380, category: "staple" },
  { id: 25, name: "納豆卵かけごはん（ネギ入り）", qty: "1杯(約270g)", cal: 391, protein: 17.8, fat: 9.8, carb: 55.2, fiber: 3.1, na: 290, category: "staple", recipe: "① 温かい白米を茶碗に盛る\n② 納豆にタレ・からしを混ぜる\n③ 卵を割り入れ、刻みネギを散らす\n④ 醤油を少々かけて混ぜる" },
  // ── 主菜 ──
  { id: 5, name: "鶏むね肉（皮なし）", qty: "100g", cal: 116, protein: 23.3, fat: 1.9, carb: 0, fiber: 0, na: 42, category: "main" },
  { id: 6, name: "鶏もも肉", qty: "100g", cal: 204, protein: 19.0, fat: 14.2, carb: 0, fiber: 0, na: 60, category: "main" },
  { id: 7, name: "豚ロース", qty: "100g", cal: 263, protein: 19.3, fat: 19.2, carb: 0.2, fiber: 0, na: 55, category: "main" },
  { id: 8, name: "牛もも肉（赤身）", qty: "100g", cal: 182, protein: 21.2, fat: 10.7, carb: 0.6, fiber: 0, na: 46, category: "main" },
  { id: 9, name: "サーモン", qty: "100g", cal: 204, protein: 21.4, fat: 12.7, carb: 0.1, fiber: 0, na: 59, category: "main" },
  { id: 10, name: "マグロ（赤身）", qty: "100g", cal: 125, protein: 26.4, fat: 1.4, carb: 0.1, fiber: 0, na: 49, category: "main" },
  { id: 11, name: "卵", qty: "1個(50g)", cal: 76, protein: 6.2, fat: 5.2, carb: 0.2, fiber: 0, na: 71, category: "main" },
  { id: 32, name: "しょうが焼き", qty: "1人前(約150g)", cal: 330, protein: 22.0, fat: 20.0, carb: 12.0, fiber: 0.5, na: 680, category: "main", recipe: "① 豚ロースに★(醤油大1、みりん大1、酒大1、すりおろし生姜1片)を10分漬ける\n② フライパンに油を熱し中火で両面焼く\n③ 残りのタレを入れ煮絡める\n④ 千切りキャベツと盛り付ける" },
  { id: 36, name: "焼き鮭", qty: "1切れ(80g)", cal: 133, protein: 18.0, fat: 6.5, carb: 0.1, fiber: 0, na: 460, category: "main", recipe: "① 鮭の切り身に軽く塩をふり10分置く\n② 水気をキッチンペーパーで拭く\n③ グリル（中火）で皮面から5分焼く\n④ 裏返して3〜4分、焼き目がつくまで焼く\n⑤ 大根おろしを添えて盛り付ける" },
  // ── 副菜 ──
  { id: 12, name: "木綿豆腐", qty: "1/2丁(150g)", cal: 108, protein: 9.9, fat: 6.3, carb: 2.4, fiber: 0.5, na: 6, category: "side" },
  { id: 29, name: "納豆", qty: "1パック(45g)", cal: 90, protein: 7.4, fat: 4.5, carb: 5.4, fiber: 3.0, na: 2, category: "side" },
  { id: 33, name: "のり", qty: "1枚(約3g)", cal: 6, protein: 1.2, fat: 0.1, carb: 0.5, fiber: 1.1, na: 48, category: "side" },
  { id: 37, name: "ほうれん草のおひたし", qty: "1人前(80g)", cal: 22, protein: 2.4, fat: 0.4, carb: 2.4, fiber: 2.2, na: 280, category: "side", recipe: "① ほうれん草をたっぷりの湯で1分茹でる\n② 冷水にとり色止めし、水気を絞る\n③ 3cm幅に切る\n④ だし醤油(大1)とかつお節をかけて和える\n\n💡ビタミンA・C・鉄分が豊富" },
  { id: 38, name: "ひじきの煮物", qty: "1人前(60g)", cal: 58, protein: 1.6, fat: 2.2, carb: 8.0, fiber: 2.6, na: 420, category: "side", recipe: "① 乾燥ひじき(10g)を水で20分戻す\n② にんじん・油揚げを細切りにする\n③ 鍋に油を熱し具材を炒める\n④ だし(100ml)・醤油(大1)・砂糖(大1/2)・みりん(大1)を加える\n⑤ 中火で10分煮て汁気を飛ばす\n\n💡カルシウム・鉄分・食物繊維が豊富" },
  { id: 39, name: "きんぴらごぼう", qty: "1人前(60g)", cal: 72, protein: 1.2, fat: 2.8, carb: 10.5, fiber: 2.4, na: 340, category: "side", recipe: "① ごぼう(1/2本)をささがきにし水にさらす\n② にんじんを細切りにする\n③ フライパンにごま油を熱し炒める\n④ 醤油(大1)・みりん(大1)・砂糖(小1)・唐辛子(少々)で味付け\n⑤ 汁気がなくなるまで炒める\n⑥ 白ごまをふる\n\n💡食物繊維が豊富で整腸効果あり" },
  { id: 40, name: "漬物（たくあん）", qty: "3切れ(30g)", cal: 8, protein: 0.3, fat: 0.1, carb: 1.6, fiber: 0.7, na: 650, category: "side" },
  { id: 41, name: "冷奴", qty: "1/2丁(150g)", cal: 84, protein: 7.8, fat: 4.8, carb: 2.7, fiber: 0.3, na: 8, category: "side", recipe: "① 絹ごし豆腐を冷蔵庫で冷やしておく\n② 器に盛り、おろし生姜・刻みネギ・かつお節をのせる\n③ 醤油をかけて完成\n\n💡良質なタンパク質・イソフラボン" },
  // ── 野菜 ──
  { id: 15, name: "ブロッコリー", qty: "100g", cal: 33, protein: 4.3, fat: 0.5, carb: 5.3, fiber: 4.4, na: 20, category: "vegetable" },
  { id: 16, name: "ほうれん草", qty: "100g", cal: 20, protein: 2.2, fat: 0.4, carb: 3.1, fiber: 2.8, na: 16, category: "vegetable" },
  { id: 17, name: "トマト", qty: "中1個(150g)", cal: 29, protein: 1.1, fat: 0.2, carb: 5.8, fiber: 1.5, na: 6, category: "vegetable" },
  { id: 42, name: "わかめ", qty: "戻し30g", cal: 5, protein: 0.6, fat: 0.1, carb: 0.7, fiber: 1.1, na: 260, category: "vegetable" },
  { id: 43, name: "小松菜", qty: "100g", cal: 14, protein: 1.5, fat: 0.2, carb: 2.4, fiber: 1.9, na: 15, category: "vegetable", recipe: "① 小松菜を3cm幅に切る\n② フライパンに油を熱し茎から炒める\n③ 葉を加えさっと炒める\n④ 塩・醤油で味付け\n\n💡カルシウム・ビタミンC・鉄分が豊富（ほうれん草より吸収しやすい）" },
  // ── 汁物 ──
  { id: 23, name: "味噌汁", qty: "1杯(180ml)", cal: 29, protein: 2.1, fat: 1.0, carb: 3.3, fiber: 0.9, na: 700, category: "soup", recipe: "① 鍋にだし汁(180ml)を沸かす\n② 好みの具材(豆腐・わかめ・ネギ等)を入れる\n③ 火を止めて味噌(大1)を溶き入れる\n④ 沸騰させずに温めて完成\n\n💡発酵食品で腸内環境を整える" },
  { id: 30, name: "おでん", qty: "1人前(約400g)", cal: 230, protein: 18.0, fat: 5.5, carb: 28.0, fiber: 3.5, na: 1200, category: "soup" },
  { id: 31, name: "お茶漬け", qty: "1杯(約250g)", cal: 270, protein: 5.5, fat: 0.8, carb: 58.0, fiber: 0.5, na: 900, category: "soup" },
  // ── 果物 ──
  { id: 18, name: "バナナ", qty: "1本(100g)", cal: 86, protein: 1.1, fat: 0.2, carb: 22.5, fiber: 1.1, na: 1, category: "fruit" },
  { id: 19, name: "りんご", qty: "中1/2個(150g)", cal: 81, protein: 0.2, fat: 0.2, carb: 21.2, fiber: 1.8, na: 1, category: "fruit" },
  // ── 乳製品・プロテイン ──
  { id: 13, name: "牛乳", qty: "200ml", cal: 134, protein: 6.6, fat: 7.6, carb: 9.6, fiber: 0, na: 100, dairy: true, category: "dairy" },
  { id: 14, name: "無脂肪ヨーグルト", qty: "100g", cal: 42, protein: 3.7, fat: 0.2, carb: 5.7, fiber: 0, na: 48, dairy: true, category: "dairy" },
  { id: 21, name: "プロテイン（WPC）", qty: "1杯(30g)", cal: 114, protein: 21.0, fat: 2.4, carb: 4.2, fiber: 0, na: 80, dairy: true, category: "dairy" },
  { id: 28, name: "プロテイン（アイソレート）", qty: "1杯(30g)", cal: 110, protein: 25.0, fat: 0.5, carb: 1.5, fiber: 0, na: 60, dairy: true, category: "dairy" },
  // ── その他 ──
  { id: 20, name: "アーモンド", qty: "10粒(15g)", cal: 92, protein: 3.2, fat: 7.9, carb: 3.0, fiber: 1.8, na: 1, category: "other" },
  { id: 22, name: "オリーブオイル", qty: "大さじ1(12g)", cal: 111, protein: 0, fat: 12.0, carb: 0, fiber: 0, na: 0, category: "other" },
  { id: 27, name: "カカオニブ", qty: "大さじ1(10g)", cal: 57, protein: 1.4, fat: 4.0, carb: 4.0, fiber: 2.7, na: 1, category: "other" },
  { id: 34, name: "やきいも", qty: "1本(約200g)", cal: 326, protein: 2.8, fat: 0.4, carb: 78.0, fiber: 4.6, na: 22, category: "other" },
];

const DRINK_DB: Drink[] = [
  { id: 1, name: "水", qty: "コップ1杯(200ml)", ml: 200, cal: 0, sugar: 0, caffeine: 0 },
  { id: 2, name: "緑茶", qty: "1杯(200ml)", ml: 200, cal: 4, sugar: 0, caffeine: 40 },
  { id: 3, name: "コーヒー（ブラック）", qty: "1杯(200ml)", ml: 200, cal: 8, sugar: 0, caffeine: 120 },
  { id: 4, name: "コーヒー（ミルク入り）", qty: "1杯(200ml)", ml: 200, cal: 30, sugar: 3, caffeine: 120 },
  { id: 5, name: "紅茶", qty: "1杯(200ml)", ml: 200, cal: 2, sugar: 0, caffeine: 50 },
  { id: 6, name: "オレンジジュース", qty: "1杯(200ml)", ml: 200, cal: 84, sugar: 20, caffeine: 0 },
  { id: 7, name: "コーラ", qty: "1缶(350ml)", ml: 350, cal: 157, sugar: 39, caffeine: 35 },
  { id: 8, name: "エナジードリンク", qty: "1缶(250ml)", ml: 250, cal: 115, sugar: 27, caffeine: 80 },
  { id: 9, name: "豆乳", qty: "1杯(200ml)", ml: 200, cal: 92, sugar: 5.6, caffeine: 0 },
  { id: 10, name: "スポーツドリンク", qty: "1本(500ml)", ml: 500, cal: 105, sugar: 25, caffeine: 0 },
  { id: 11, name: "炭酸水", qty: "1杯(200ml)", ml: 200, cal: 0, sugar: 0, caffeine: 0 },
  { id: 12, name: "ココア", qty: "1杯(200ml)", ml: 200, cal: 130, sugar: 15, caffeine: 12 },
  { id: 13, name: "味噌汁", qty: "1杯(180ml)", ml: 180, cal: 29, sugar: 2, caffeine: 0 },
  { id: 14, name: "ほうじ茶", qty: "1杯(200ml)", ml: 200, cal: 0, sugar: 0, caffeine: 30 },
  { id: 15, name: "麦茶", qty: "1杯(200ml)", ml: 200, cal: 2, sugar: 0, caffeine: 0 },
];

const EXERCISE_DB: Exercise[] = [
  { id: 1, name: "ウォーキング", met: 3.5, unit: "分", icon: "🚶" },
  { id: 2, name: "ジョギング", met: 7.0, unit: "分", icon: "🏃" },
  { id: 3, name: "ランニング（速め）", met: 9.8, unit: "分", icon: "🏃" },
  { id: 4, name: "サイクリング", met: 6.8, unit: "分", icon: "🚴" },
  { id: 5, name: "水泳", met: 8.0, unit: "分", icon: "🏊" },
  { id: 6, name: "筋力トレーニング", met: 5.0, unit: "分", icon: "🏋️" },
  { id: 7, name: "HIIT", met: 12.0, unit: "分", icon: "⚡" },
  { id: 8, name: "ヨガ", met: 2.5, unit: "分", icon: "🧘" },
  { id: 9, name: "縄跳び", met: 10.0, unit: "分", icon: "🪢" },
  { id: 10, name: "階段昇降", met: 8.0, unit: "分", icon: "🪜" },
  { id: 11, name: "ストレッチ", met: 2.3, unit: "分", icon: "🤸" },
  { id: 12, name: "バスケットボール", met: 8.0, unit: "分", icon: "🏀" },
  { id: 13, name: "テニス", met: 7.3, unit: "分", icon: "🎾" },
  { id: 14, name: "サッカー", met: 7.0, unit: "分", icon: "⚽" },
  { id: 15, name: "ダンス", met: 5.5, unit: "分", icon: "💃" },
];

const HAMA_SUSHI_DB: HamaSushiItem[] = [
  // ── にぎり ──
  { id: 501, name: "まぐろ", qty: "2貫", cal: 88, protein: 7.8, fat: 0.4, carb: 12.8, fiber: 0, na: 180, category: "nigiri" },
  { id: 502, name: "サーモン", qty: "2貫", cal: 110, protein: 6.8, fat: 4.2, carb: 12.8, fiber: 0, na: 170, category: "nigiri" },
  { id: 503, name: "えび", qty: "2貫", cal: 73, protein: 5.8, fat: 0.2, carb: 12.4, fiber: 0, na: 200, category: "nigiri" },
  { id: 504, name: "はまち", qty: "2貫", cal: 96, protein: 6.4, fat: 2.8, carb: 12.6, fiber: 0, na: 160, category: "nigiri" },
  { id: 505, name: "えんがわ", qty: "2貫", cal: 102, protein: 4.2, fat: 4.6, carb: 12.6, fiber: 0, na: 160, category: "nigiri" },
  { id: 506, name: "たまご", qty: "2貫", cal: 104, protein: 4.0, fat: 2.4, carb: 16.8, fiber: 0, na: 220, category: "nigiri" },
  { id: 507, name: "真いか", qty: "2貫", cal: 71, protein: 5.6, fat: 0.2, carb: 12.4, fiber: 0, na: 140, category: "nigiri" },
  { id: 508, name: "とろびんちょう", qty: "2貫", cal: 80, protein: 6.2, fat: 1.0, carb: 12.6, fiber: 0, na: 160, category: "nigiri" },
  { id: 509, name: "大とろサーモン", qty: "2貫", cal: 122, protein: 6.2, fat: 5.8, carb: 12.6, fiber: 0, na: 170, category: "nigiri" },
  { id: 510, name: "甘えび", qty: "2貫", cal: 72, protein: 5.4, fat: 0.4, carb: 12.4, fiber: 0, na: 180, category: "nigiri" },
  { id: 511, name: "漬けまぐろ", qty: "2貫", cal: 95, protein: 8.0, fat: 0.5, carb: 13.6, fiber: 0, na: 320, category: "nigiri" },
  { id: 512, name: "炙りサーモン", qty: "2貫", cal: 118, protein: 6.6, fat: 5.0, carb: 13.0, fiber: 0, na: 190, category: "nigiri" },
  { id: 513, name: "つぶ貝", qty: "2貫", cal: 68, protein: 5.4, fat: 0.2, carb: 12.2, fiber: 0, na: 160, category: "nigiri" },
  { id: 514, name: "生えび", qty: "2貫", cal: 72, protein: 5.6, fat: 0.3, carb: 12.4, fiber: 0, na: 170, category: "nigiri" },
  // ── 軍艦・巻物 ──
  { id: 551, name: "ネギトロ軍艦", qty: "2貫", cal: 100, protein: 4.0, fat: 2.8, carb: 14.0, fiber: 0.2, na: 200, category: "gunkan" },
  { id: 552, name: "ツナサラダ軍艦", qty: "2貫", cal: 120, protein: 4.2, fat: 5.0, carb: 14.2, fiber: 0.1, na: 240, category: "gunkan" },
  { id: 553, name: "コーン軍艦", qty: "2貫", cal: 108, protein: 2.6, fat: 3.0, carb: 17.0, fiber: 0.6, na: 210, category: "gunkan" },
  { id: 554, name: "納豆軍艦", qty: "2貫", cal: 95, protein: 5.0, fat: 1.8, carb: 14.8, fiber: 1.2, na: 200, category: "gunkan" },
  { id: 555, name: "いくら軍艦", qty: "2貫", cal: 96, protein: 6.0, fat: 2.4, carb: 12.8, fiber: 0, na: 280, category: "gunkan" },
  { id: 556, name: "かっぱ巻き", qty: "3切", cal: 82, protein: 1.8, fat: 0.2, carb: 17.8, fiber: 0.6, na: 180, category: "gunkan" },
  { id: 557, name: "鉄火巻き", qty: "3切", cal: 98, protein: 5.8, fat: 0.3, carb: 17.6, fiber: 0.2, na: 220, category: "gunkan" },
  // ── サイドメニュー ──
  { id: 601, name: "鶏唐揚げ", qty: "1人前", cal: 280, protein: 16.0, fat: 18.0, carb: 14.0, fiber: 0.2, na: 500, category: "side" },
  { id: 602, name: "あさりの味噌汁", qty: "1杯", cal: 42, protein: 3.2, fat: 1.0, carb: 4.2, fiber: 0.4, na: 680, category: "side" },
  { id: 603, name: "茶碗蒸し", qty: "1個", cal: 98, protein: 7.4, fat: 4.2, carb: 6.8, fiber: 0.1, na: 420, category: "side" },
  { id: 604, name: "枝豆", qty: "1皿", cal: 70, protein: 6.0, fat: 3.2, carb: 4.6, fiber: 2.4, na: 200, category: "side" },
  { id: 605, name: "フライドポテト", qty: "1人前", cal: 260, protein: 3.0, fat: 13.0, carb: 33.0, fiber: 2.4, na: 320, category: "side" },
  { id: 606, name: "たこ焼き", qty: "1人前(6個)", cal: 230, protein: 6.4, fat: 10.0, carb: 28.0, fiber: 0.6, na: 580, category: "side" },
];

const TONDEN_DB: TondenItem[] = [
  // ── 御膳 (Set Meals) ──
  { id: 701, name: "とんでん御膳", qty: "1人前", cal: 557, protein: 21.9, fat: 20.1, carb: 70.4, fiber: 3.0, na: 1575, category: "gozen" },
  { id: 702, name: "北海刺身天ぷら膳", qty: "1人前", cal: 683, protein: 29.9, fat: 26.0, carb: 77.7, fiber: 3.5, na: 1457, category: "gozen" },
  { id: 703, name: "刺身天ぷら膳", qty: "1人前", cal: 724, protein: 29.8, fat: 27.4, carb: 85.3, fiber: 3.5, na: 1575, category: "gozen" },
  { id: 704, name: "旨いわし巴膳", qty: "1人前", cal: 774, protein: 30.3, fat: 28.4, carb: 95.6, fiber: 4.0, na: 2559, category: "gozen" },
  { id: 705, name: "旨いわしお楽しみ膳", qty: "1人前", cal: 911, protein: 32.2, fat: 32.3, carb: 117.2, fiber: 4.5, na: 2913, category: "gozen" },
  // ── 寿司 (Sushi) ──
  { id: 721, name: "握り上鮨", qty: "1人前", cal: 450, protein: 22.0, fat: 8.5, carb: 70.0, fiber: 1.0, na: 1100, category: "sushi" },
  { id: 722, name: "大漁鮨", qty: "1人前", cal: 760, protein: 35.0, fat: 16.0, carb: 110.0, fiber: 2.0, na: 1800, category: "sushi" },
  { id: 723, name: "活ほっき貝のにぎり鮨", qty: "1人前", cal: 181, protein: 9.0, fat: 1.5, carb: 34.6, fiber: 0.5, na: 500, category: "sushi" },
  // ── 丼 (Rice Bowls) ──
  { id: 741, name: "うな重", qty: "1人前", cal: 860, protein: 39.1, fat: 27.8, carb: 108.0, fiber: 2.0, na: 1811, category: "don" },
  { id: 742, name: "鰻のひつまぶし", qty: "1人前", cal: 894, protein: 41.0, fat: 28.0, carb: 114.6, fiber: 2.5, na: 2598, category: "don" },
  { id: 743, name: "ミニかに丼・北海道ざるそば", qty: "1セット", cal: 625, protein: 25.8, fat: 7.6, carb: 108.9, fiber: 3.0, na: 1811, category: "don" },
  { id: 744, name: "ミニいくら丼・北海道ざるそば", qty: "1セット", cal: 676, protein: 29.3, fat: 11.7, carb: 109.3, fiber: 3.0, na: 1850, category: "don" },
  { id: 745, name: "ミニ本まぐろ丼・北海道ざるそば", qty: "1セット", cal: 789, protein: 28.3, fat: 25.3, carb: 106.2, fiber: 3.0, na: 1220, category: "don" },
  { id: 746, name: "ミニひれかつ丼・北海道ざるそば", qty: "1セット", cal: 696, protein: 26.0, fat: 16.0, carb: 108.0, fiber: 3.5, na: 1800, category: "don" },
  // ── そば・うどん (Noodles) ──
  { id: 761, name: "北海道ざるそば", qty: "1人前", cal: 340, protein: 14.0, fat: 2.5, carb: 65.0, fiber: 3.0, na: 800, category: "soba_udon" },
  { id: 762, name: "ざるうどん", qty: "1人前", cal: 213, protein: 7.0, fat: 1.0, carb: 41.9, fiber: 1.5, na: 700, category: "soba_udon" },
  { id: 763, name: "ランチ天丼・北海道ざるそば", qty: "1セット", cal: 1034, protein: 26.8, fat: 32.0, carb: 153.1, fiber: 4.0, na: 1850, category: "soba_udon" },
  { id: 764, name: "ランチにぎり鮨・ざるうどん", qty: "1セット", cal: 563, protein: 22.0, fat: 8.0, carb: 96.0, fiber: 2.0, na: 1500, category: "soba_udon" },
  // ── 単品 (À la carte) ──
  { id: 781, name: "富良野産ロースかつ", qty: "1人前", cal: 559, protein: 28.0, fat: 35.0, carb: 20.8, fiber: 1.0, na: 900, category: "single" },
  { id: 782, name: "CP持・うな重", qty: "1人前", cal: 843, protein: 35.2, fat: 26.0, carb: 111.9, fiber: 2.0, na: 1496, category: "single" },
];

const TONDEN_CATEGORIES: { id: TondenItem["category"] | "all"; label: string; icon: string }[] = [
  { id: "all", label: "すべて", icon: "📋" },
  { id: "gozen", label: "御膳", icon: "🍱" },
  { id: "sushi", label: "寿司", icon: "🍣" },
  { id: "don", label: "丼", icon: "🍚" },
  { id: "soba_udon", label: "そば・うどん", icon: "🍜" },
  { id: "single", label: "単品", icon: "🍽️" },
];

const HAMA_CATEGORIES: { id: HamaSushiItem["category"] | "all"; label: string; icon: string }[] = [
  { id: "all", label: "すべて", icon: "📋" },
  { id: "nigiri", label: "にぎり", icon: "🍣" },
  { id: "gunkan", label: "軍艦・巻物", icon: "🍙" },
  { id: "side", label: "サイド", icon: "🍟" },
];

const ALL_FOOD_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: "all", label: "すべて", icon: "📋" },
  { id: "staple", label: "主食", icon: "🍚" },
  { id: "main", label: "主菜", icon: "🐟" },
  { id: "side", label: "副菜", icon: "🥬" },
  { id: "vegetable", label: "野菜", icon: "🥦" },
  { id: "soup", label: "汁物", icon: "🍲" },
  { id: "fruit", label: "果物", icon: "🍎" },
  { id: "dairy", label: "乳製品", icon: "🥛" },
  { id: "other", label: "その他", icon: "🥜" },
  { id: "hama_nigiri", label: "はま寿司:にぎり", icon: "🍣" },
  { id: "hama_gunkan", label: "はま寿司:軍艦", icon: "🍙" },
  { id: "hama_side", label: "はま寿司:サイド", icon: "🍟" },
  { id: "tonden_gozen", label: "とんでん:御膳", icon: "🍱" },
  { id: "tonden_sushi", label: "とんでん:寿司", icon: "🍣" },
  { id: "tonden_don", label: "とんでん:丼", icon: "🍚" },
  { id: "tonden_soba_udon", label: "とんでん:麺", icon: "🍜" },
  { id: "tonden_single", label: "とんでん:単品", icon: "🍽️" },
];

const MEAL_SLOTS = ["朝食", "昼食", "夕食", "間食"];
const DEFAULT_GOALS: Record<string, number> = { cal: 2000, protein: 80, fat: 55, carb: 250, fiber: 21, na: 2500 };

const sum = (items: FoodLog[], key: keyof FoodLog): number => items.reduce((a, f) => a + (Number(f[key]) || 0), 0);
const pct = (v: number, max: number): number => Math.min(100, max > 0 ? (v / max) * 100 : 0);
const fmt = (v: number): number => Number.isInteger(v) ? v : parseFloat(v.toFixed(1));

const statusColor = (p: number): string =>
  p <= 60 ? "#2563EB" : p <= 100 ? "#16A34A" : p <= 120 ? "#D97706" : "#DC2626";

const Divider = () => <div style={{ height: 1, background: "#F3F4F6" }} />;

function MetricRow({ label, value, unit, goal }: { label: string; value: number; unit: string; goal?: number }) {
  const p = goal ? pct(value, goal) : null;
  const col = p !== null ? statusColor(p) : "#111827";
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "9px 0", gap: 8 }}>
      <div style={{ width: 130, fontSize: 12, color: "#6B7280", letterSpacing: 0.3, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1 }}>
        {goal && (
          <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, overflow: "hidden", marginBottom: 0 }}>
            <div style={{ height: "100%", borderRadius: 2, background: col, width: `${pct(value, goal)}%`, transition: "width 0.6s ease" }} />
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3, minWidth: 100, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: col, fontVariantNumeric: "tabular-nums" }}>{fmt(value)}</span>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>/{goal ?? ""} {unit}</span>
      </div>
    </div>
  );
}

export default function NutritionApp() {
  const [tab, setTab] = useState("record");
  const [meal, setMeal] = useState("朝食");
  const [query, setQuery] = useState("");
  const EMPTY_LOGS: Logs = { 朝食: [], 昼食: [], 夕食: [], 間食: [] };

  // ── Persistent state ──
  const [logs, setLogs] = useState<Logs>(EMPTY_LOGS);
  const [goals, setGoals] = useState<Record<string, number>>(DEFAULT_GOALS);
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [drinks, setDrinks] = useState<DrinkLog[]>([]);
  const [bodyWeight, setBodyWeight] = useState(65);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // ── Ephemeral UI state ──
  const [editGoals, setEditGoals] = useState(false);
  const [tmpGoals, setTmpGoals] = useState<Record<string, number>>(DEFAULT_GOALS);
  const [hoverFood, setHoverFood] = useState<number | null>(null);
  const [hoverLog, setHoverLog] = useState<number | null>(null);
  const [exQuery, setExQuery] = useState("");
  const [hoverEx, setHoverEx] = useState<number | null>(null);
  const [hoverExLog, setHoverExLog] = useState<number | null>(null);
  const [exMinutes, setExMinutes] = useState<Record<number, number>>({});
  const [drinkQuery, setDrinkQuery] = useState("");
  const [hoverDrink, setHoverDrink] = useState<number | null>(null);
  const [hoverDrinkLog, setHoverDrinkLog] = useState<number | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [hamaCategory, setHamaCategory] = useState<HamaSushiItem["category"] | "all">("all");
  const [hamaQuery, setHamaQuery] = useState("");
  const [hoverHama, setHoverHama] = useState<number | null>(null);
  const [tondenCategory, setTondenCategory] = useState<TondenItem["category"] | "all">("all");
  const [tondenQuery, setTondenQuery] = useState("");
  const [hoverTonden, setHoverTonden] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [recipeModal, setRecipeModal] = useState<Food | null>(null);
  const [allCategory, setAllCategory] = useState("all");
  const [allQuery, setAllQuery] = useState("");
  const [hoverAll, setHoverAll] = useState<number | null>(null);

  // ── Load persisted data on mount ──
  useEffect(() => {
    const session = storage.loadSession();
    if (session) {
      setLogs(session.logs);
      setExercises(session.exercises);
      setDrinks(session.drinks);
      setGoals(session.goals);
      setBodyWeight(session.bodyWeight);
    }
    setHistory(storage.loadHistory());
    setLoaded(true);
  }, []);

  // ── Auto-save session on every persistent state change ──
  const saveSession = useCallback(() => {
    if (!loaded) return;
    storage.saveSession({ logs, exercises, drinks, goals, bodyWeight });
  }, [logs, exercises, drinks, goals, bodyWeight, loaded]);

  useEffect(() => {
    saveSession();
  }, [saveSession]);

  const allItems = Object.values(logs).flat();
  const totals = {
    cal: sum(allItems, "cal"),
    protein: sum(allItems, "protein"),
    fat: sum(allItems, "fat"),
    carb: sum(allItems, "carb"),
    fiber: sum(allItems, "fiber"),
    na: sum(allItems, "na"),
  };
  const drinkTotals: DrinkTotals = {
    ml: drinks.reduce((a, d) => a + d.ml, 0),
    cal: drinks.reduce((a, d) => a + d.cal, 0),
    sugar: drinks.reduce((a, d) => a + d.sugar, 0),
    caffeine: drinks.reduce((a, d) => a + d.caffeine, 0),
  };

  const filtered = query.trim()
    ? FOOD_DB.filter(f => f.name.includes(query) || f.qty.includes(query))
    : FOOD_DB;
  const filteredDrinks = drinkQuery.trim()
    ? DRINK_DB.filter(d => d.name.includes(drinkQuery))
    : DRINK_DB;
  const filteredHama = HAMA_SUSHI_DB.filter(h => {
    const matchCat = hamaCategory === "all" || h.category === hamaCategory;
    const matchQ = !hamaQuery.trim() || h.name.includes(hamaQuery);
    return matchCat && matchQ;
  });
  const filteredTonden = TONDEN_DB.filter(t => {
    const matchCat = tondenCategory === "all" || t.category === tondenCategory;
    const matchQ = !tondenQuery.trim() || t.name.includes(tondenQuery);
    return matchCat && matchQ;
  });

  const addFood = (food: Food) => {
    setLogs(p => ({ ...p, [meal]: [...p[meal], { ...food, uid: Date.now() + Math.random() }] }));
    setQuery("");
    inputRef.current?.focus();
  };
  const removeFood = (slot: string, uid: number) =>
    setLogs(p => ({ ...p, [slot]: p[slot].filter(f => f.uid !== uid) }));
  const addDrink = (d: Drink) => {
    setDrinks(p => [...p, { ...d, uid: Date.now() + Math.random() }]);
    setDrinkQuery("");
  };
  const removeDrink = (uid: number) => setDrinks(p => p.filter(d => d.uid !== uid));

  const burnedCal = exercises.reduce((a: number, e: ExerciseLog) => a + e.burned, 0);

  const saveToHistory = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const entry: HistoryEntry = {
      date: dateStr, logs: { ...logs }, exercises: [...exercises],
      drinks: [...drinks], totals: { ...totals }, drinkTotals: { ...drinkTotals }, burnedCal,
    };
    const newHistory = [entry, ...history.filter(h => h.date !== dateStr)];
    setHistory(newHistory);
    storage.saveHistory(newHistory);
    setToast("✅ 保存しました");
    setTimeout(() => setToast(""), 2500);
  };

  const resetAll = () => {
    if (confirm("本日の記録をすべてリセットしますか？")) {
      setLogs({ 朝食: [], 昼食: [], 夕食: [], 間食: [] });
      setExercises([]);
      setDrinks([]);
    }
  };

  const deleteHistoryEntry = (date: string) => {
    if (confirm(`${date} の記録を削除しますか？`)) {
      const newHistory = history.filter(h => h.date !== date);
      setHistory(newHistory);
      storage.saveHistory(newHistory);
    }
  };
  const netCal = totals.cal - burnedCal;
  const remaining = goals.cal - netCal;
  const over = remaining < 0;

  const panel: CSSProperties = {
    background: "#FFFFFF", border: "1px solid #E5E7EB",
    borderRadius: 12, overflow: "hidden", margin: "12px 16px",
  };
  const panelHdr: CSSProperties = {
    padding: "10px 16px", borderBottom: "1px solid #F3F4F6",
    background: "#F9FAFB", display: "flex", justifyContent: "space-between", alignItems: "center",
  };
  const panelTitle: CSSProperties = { fontSize: 10, letterSpacing: 2, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 };

  return (
    <div style={{
      fontFamily: "'Outfit','Noto Sans JP',sans-serif",
      background: "#F9FAFB", minHeight: "100vh",
      maxWidth: 480, margin: "0 auto",
      color: "#111827", paddingBottom: 72,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "#FFFFFF", borderBottom: "1px solid #E5E7EB",
        padding: "18px 20px 14px", position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>
              Clinical Nutrition System
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: "#111827" }}>栄養管理記録</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
            </div>
          </div>
          <div style={{
            border: `1.5px solid ${over ? "#DC2626" : "#16A34A"}`,
            borderRadius: 6, padding: "6px 12px", textAlign: "center",
            background: over ? "#FEF2F2" : "#F0FDF4",
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: over ? "#DC2626" : "#16A34A", fontVariantNumeric: "tabular-nums" }}>
              {Math.abs(Math.round(remaining))}
            </div>
            <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1, textTransform: "uppercase" }}>
              {over ? "超過 kcal" : "残り kcal"}
            </div>
          </div>
        </div>

        {/* Summary grid */}
        <div style={{
          marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 1, background: "#E5E7EB", borderRadius: 8, overflow: "hidden", border: "1px solid #E5E7EB",
        }}>
          {[
            { label: "摂取", val: `${Math.round(totals.cal)}`, unit: "kcal" },
            { label: "消費", val: `${Math.round(burnedCal)}`, unit: "kcal" },
            { label: "純収支", val: `${Math.round(netCal)}`, unit: "kcal" },
            { label: "P", val: `${fmt(totals.protein)}`, unit: "g" },
          ].map(({ label, val, unit }) => (
            <div key={label} style={{ background: "#FFFFFF", padding: "7px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{val}</div>
              <div style={{ fontSize: 9, color: "#CBD5E1" }}>{unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RECORD TAB ── */}
      {tab === "record" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          {/* Meal tabs */}
          <div style={{ display: "flex", gap: 6, padding: "12px 16px 0", overflowX: "auto", scrollbarWidth: "none" }}>
            {MEAL_SLOTS.map(m => (
              <button key={m} onClick={() => setMeal(m)} style={{
                padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${meal === m ? "#111827" : "#E5E7EB"}`,
                background: meal === m ? "#111827" : "#FFFFFF",
                color: meal === m ? "#FFFFFF" : "#6B7280",
                fontSize: 12, fontWeight: meal === m ? 700 : 400,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s",
              }}>{m}</button>
            ))}
          </div>

          {/* Search */}
          <div style={{ ...panel, marginTop: 12 }}>
            <div style={panelHdr}>
              <span style={panelTitle}>食品検索データベース</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{FOOD_DB.length}品目</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #E5E7EB", background: "#FDFDFD" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`${meal}に追加する食品を検索...`}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "inherit" }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, lineHeight: 1, fontSize: 16 }}>×</button>
              )}
            </div>
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {filtered.length === 0 && (
                <div style={{ padding: "24px 0", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>該当する食品が見つかりません</div>
              )}
              {filtered.map(f => (
                <div key={f.id}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, cursor: "pointer", background: hoverFood === f.id ? "#F9FAFB" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={() => setHoverFood(f.id)}
                  onMouseLeave={() => setHoverFood(null)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{f.name}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{f.qty}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
                      {[
                        { label: `P ${f.protein}g`, col: "#2563EB" },
                        { label: `F ${f.fat}g`, col: "#D97706" },
                        { label: `C ${f.carb}g`, col: "#059669" },
                      ].map(({ label, col }) => (
                        <span key={label} style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: `${col}18`, color: col, fontSize: 10, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                          {label}
                        </span>
                      ))}
                      {f.dairy && (
                        <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: "#FEF3C710", border: "1px solid #FDE68A", color: "#92400E", fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>
                          🥛 乳製品
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{f.cal}</div>
                      <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 0.5 }}>kcal</div>
                    </div>
                    <button onClick={() => addFood(f)} style={{
                      width: 28, height: 28, borderRadius: 6, background: "#111827", border: "none",
                      color: "#FFFFFF", fontSize: 20, fontWeight: 300, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0,
                    }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logged items */}
          {MEAL_SLOTS.filter(s => logs[s].length > 0).map(slot => (
            <div key={slot} style={panel}>
              <div style={panelHdr}>
                <span style={panelTitle}>{slot}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(sum(logs[slot], "cal"))} kcal
                </span>
              </div>
              {logs[slot].map(f => (
                <div key={f.uid}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, background: hoverLog === f.uid ? "#FEF2F2" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6", cursor: "default" }}
                  onMouseEnter={() => setHoverLog(f.uid)}
                  onMouseLeave={() => setHoverLog(null)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{f.name}</span>
                      {f.dairy && (
                        <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E", fontSize: 9, fontWeight: 700, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
                          🥛 乳製品
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>{f.qty}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums", minWidth: 56, textAlign: "right" }}>
                    {f.cal} kcal
                  </div>
                  <button onClick={() => removeFood(slot, f.uid)} style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: "transparent", border: "1px solid #FCA5A5",
                    color: "#DC2626", fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: 6,
                  }}>×</button>
                </div>
              ))}
            </div>
          ))}

          {allItems.length === 0 && drinks.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0 24px", color: "#9CA3AF", fontSize: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>NO RECORDS</div>
              上記の検索から食品を追加してください
            </div>
          )}

          {/* Drink search */}
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>🥤 飲み物データベース</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{DRINK_DB.length}品目</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #E5E7EB", background: "#FDFDFD" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={drinkQuery}
                onChange={e => setDrinkQuery(e.target.value)}
                placeholder="飲み物を検索..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "inherit" }}
              />
              {drinkQuery && (
                <button onClick={() => setDrinkQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, lineHeight: 1, fontSize: 16 }}>×</button>
              )}
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {filteredDrinks.length === 0 && (
                <div style={{ padding: "24px 0", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>該当する飲み物が見つかりません</div>
              )}
              {filteredDrinks.map(d => (
                <div key={d.id}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, cursor: "pointer", background: hoverDrink === d.id ? "#F9FAFB" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={() => setHoverDrink(d.id)}
                  onMouseLeave={() => setHoverDrink(null)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{d.name}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{d.qty}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: "#2563EB18", color: "#2563EB", fontSize: 10, fontWeight: 700 }}>{d.ml}ml</span>
                      {d.cal > 0 && <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: "#D9770618", color: "#D97706", fontSize: 10, fontWeight: 700 }}>{d.cal}kcal</span>}
                      {d.caffeine > 0 && <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: "#7C3AED18", color: "#7C3AED", fontSize: 10, fontWeight: 700 }}>☕{d.caffeine}mg</span>}
                      {d.sugar > 0 && <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: "#DC262618", color: "#DC2626", fontSize: 10, fontWeight: 700 }}>糖{d.sugar}g</span>}
                    </div>
                  </div>
                  <button onClick={() => addDrink(d)} style={{
                    width: 28, height: 28, borderRadius: 6, background: "#111827", border: "none",
                    color: "#FFFFFF", fontSize: 20, fontWeight: 300, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0,
                  }}>+</button>
                </div>
              ))}
            </div>
          </div>

          {/* Logged drinks */}
          {drinks.length > 0 && (
            <div style={panel}>
              <div style={panelHdr}>
                <span style={panelTitle}>飲み物記録</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", fontVariantNumeric: "tabular-nums" }}>
                  💧{drinkTotals.ml}ml
                </span>
              </div>
              {drinks.map(d => (
                <div key={d.uid}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, background: hoverDrinkLog === d.uid ? "#EFF6FF" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={() => setHoverDrinkLog(d.uid)}
                  onMouseLeave={() => setHoverDrinkLog(null)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{d.name}</span>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>{d.qty}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", fontVariantNumeric: "tabular-nums", minWidth: 50, textAlign: "right" }}>
                    {d.ml}ml
                  </div>
                  <button onClick={() => removeDrink(d.uid)} style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: "transparent", border: "1px solid #FCA5A5",
                    color: "#DC2626", fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: 6,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Reset button */}
          {(allItems.length > 0 || drinks.length > 0 || exercises.length > 0) && (
            <div style={{ padding: "12px 16px" }}>
              <button onClick={resetAll} style={{
                width: "100%", padding: "12px", borderRadius: 10,
                border: "1px solid #FCA5A5", background: "#FEF2F2",
                color: "#DC2626", fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", letterSpacing: 0.5,
              }}>🗑 本日の記録をリセット</button>
            </div>
          )}
        </div>
      )}

      {/* ── HAMA SUSHI TAB ── */}
      {tab === "hamasushi" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          {/* Current meal indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px 0" }}>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>追加先：</span>
            {MEAL_SLOTS.map(m => (
              <button key={m} onClick={() => setMeal(m)} style={{
                padding: "4px 12px", borderRadius: 16,
                border: `1px solid ${meal === m ? "#111827" : "#E5E7EB"}`,
                background: meal === m ? "#111827" : "#FFFFFF",
                color: meal === m ? "#FFFFFF" : "#6B7280",
                fontSize: 11, fontWeight: meal === m ? 700 : 400,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s",
              }}>{m}</button>
            ))}
          </div>

          {/* Category filter chips */}
          <div style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
            {HAMA_CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setHamaCategory(c.id)} style={{
                padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${hamaCategory === c.id ? "#EA580C" : "#E5E7EB"}`,
                background: hamaCategory === c.id ? "#EA580C" : "#FFFFFF",
                color: hamaCategory === c.id ? "#FFFFFF" : "#6B7280",
                fontSize: 12, fontWeight: hamaCategory === c.id ? 700 : 400,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s",
              }}>{c.icon} {c.label}</button>
            ))}
          </div>

          {/* Hama sushi menu list */}
          <div style={panel}>
            <div style={panelHdr}>
              <span style={{ ...panelTitle, display: "flex", alignItems: "center", gap: 6 }}>🍣 はま寿司メニュー</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{filteredHama.length}品目</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #E5E7EB", background: "#FDFDFD" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={hamaQuery}
                onChange={e => setHamaQuery(e.target.value)}
                placeholder="寿司ネタを検索..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "inherit" }}
              />
              {hamaQuery && (
                <button onClick={() => setHamaQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, lineHeight: 1, fontSize: 16 }}>×</button>
              )}
            </div>
            <div style={{ maxHeight: 460, overflowY: "auto" }}>
              {filteredHama.length === 0 && (
                <div style={{ padding: "24px 0", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>該当するメニューが見つかりません</div>
              )}
              {filteredHama.map(h => (
                <div key={h.id}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, cursor: "pointer", background: hoverHama === h.id ? "#FFF7ED" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={() => setHoverHama(h.id)}
                  onMouseLeave={() => setHoverHama(null)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{h.name}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{h.qty}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
                      {[
                        { label: `P ${h.protein}g`, col: "#2563EB" },
                        { label: `F ${h.fat}g`, col: "#D97706" },
                        { label: `C ${h.carb}g`, col: "#059669" },
                      ].map(({ label, col }) => (
                        <span key={label} style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: `${col}18`, color: col, fontSize: 10, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                          {label}
                        </span>
                      ))}
                      <span style={{
                        display: "inline-block", padding: "1px 7px", borderRadius: 4,
                        background: h.category === "nigiri" ? "#EA580C18" : h.category === "gunkan" ? "#7C3AED18" : "#0369A118",
                        color: h.category === "nigiri" ? "#EA580C" : h.category === "gunkan" ? "#7C3AED" : "#0369A1",
                        fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
                      }}>
                        {h.category === "nigiri" ? "🍣 にぎり" : h.category === "gunkan" ? "🍙 軍艦" : "🍟 サイド"}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{h.cal}</div>
                      <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 0.5 }}>kcal</div>
                    </div>
                    <button onClick={() => addFood(h)} style={{
                      width: 28, height: 28, borderRadius: 6, background: "#EA580C", border: "none",
                      color: "#FFFFFF", fontSize: 20, fontWeight: 300, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0,
                    }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Show what's been added this session via hama sushi */}
          {logs[meal].length > 0 && (
            <div style={panel}>
              <div style={panelHdr}>
                <span style={panelTitle}>{meal}の記録</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(sum(logs[meal], "cal"))} kcal
                </span>
              </div>
              {logs[meal].map(f => (
                <div key={f.uid}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, borderBottom: "1px solid #F3F4F6" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{f.name}</span>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>{f.qty}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums", minWidth: 56, textAlign: "right" }}>
                    {f.cal} kcal
                  </div>
                  <button onClick={() => removeFood(meal, f.uid)} style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: "transparent", border: "1px solid #FCA5A5",
                    color: "#DC2626", fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: 6,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TONDEN TAB ── */}
      {tab === "tonden" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          {/* Current meal indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px 0" }}>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>追加先：</span>
            {MEAL_SLOTS.map(m => (
              <button key={m} onClick={() => setMeal(m)} style={{
                padding: "4px 12px", borderRadius: 16,
                border: `1px solid ${meal === m ? "#111827" : "#E5E7EB"}`,
                background: meal === m ? "#111827" : "#FFFFFF",
                color: meal === m ? "#FFFFFF" : "#6B7280",
                fontSize: 11, fontWeight: meal === m ? 700 : 400,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s",
              }}>{m}</button>
            ))}
          </div>

          {/* Category filter chips */}
          <div style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
            {TONDEN_CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setTondenCategory(c.id)} style={{
                padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${tondenCategory === c.id ? "#1B5E20" : "#E5E7EB"}`,
                background: tondenCategory === c.id ? "#1B5E20" : "#FFFFFF",
                color: tondenCategory === c.id ? "#FFFFFF" : "#6B7280",
                fontSize: 12, fontWeight: tondenCategory === c.id ? 700 : 400,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s",
              }}>{c.icon} {c.label}</button>
            ))}
          </div>

          {/* Sodium warning */}
          <div style={{ margin: "0 16px 8px", padding: "8px 12px", borderRadius: 8, background: "#FFF8E1", border: "1px solid #FFE082", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span style={{ fontSize: 10, color: "#6D4C00", lineHeight: 1.4 }}>とんでんの御膳・セットメニューは食塩相当量が高めです。味噌汁のスープを残す等で塩分を調整してください。</span>
          </div>

          {/* Tonden menu list */}
          <div style={panel}>
            <div style={panelHdr}>
              <span style={{ ...panelTitle, display: "flex", alignItems: "center", gap: 6 }}>🍱 とんでんメニュー</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{filteredTonden.length}品目</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #E5E7EB", background: "#FDFDFD" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={tondenQuery}
                onChange={e => setTondenQuery(e.target.value)}
                placeholder="メニューを検索..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "inherit" }}
              />
              {tondenQuery && (
                <button onClick={() => setTondenQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, lineHeight: 1, fontSize: 16 }}>×</button>
              )}
            </div>
            <div style={{ maxHeight: 460, overflowY: "auto" }}>
              {filteredTonden.length === 0 && (
                <div style={{ padding: "24px 0", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>該当するメニューが見つかりません</div>
              )}
              {filteredTonden.map(t => {
                const saltG = (t.na / 1000 * 2.54);
                const catLabel = t.category === "gozen" ? "🍱 御膳" : t.category === "sushi" ? "🍣 寿司" : t.category === "don" ? "🍚 丼" : t.category === "soba_udon" ? "🍜 麺" : "🍽️ 単品";
                const catCol = t.category === "gozen" ? "#1B5E20" : t.category === "sushi" ? "#E65100" : t.category === "don" ? "#4E342E" : t.category === "soba_udon" ? "#1565C0" : "#6A1B9A";
                return (
                  <div key={t.id}
                    style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, cursor: "pointer", background: hoverTonden === t.id ? "#E8F5E9" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                    onMouseEnter={() => setHoverTonden(t.id)}
                    onMouseLeave={() => setHoverTonden(null)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{t.name}</span>
                        <span style={{ fontSize: 10, color: "#9CA3AF" }}>{t.qty}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
                        {[
                          { label: `P ${t.protein}g`, col: "#2563EB" },
                          { label: `F ${t.fat}g`, col: "#D97706" },
                          { label: `C ${t.carb}g`, col: "#059669" },
                        ].map(({ label, col }) => (
                          <span key={label} style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: `${col}18`, color: col, fontSize: 10, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                            {label}
                          </span>
                        ))}
                        <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: saltG > 4 ? "#DC262618" : "#9CA3AF18", color: saltG > 4 ? "#DC2626" : "#6B7280", fontSize: 9, fontWeight: 700, letterSpacing: 0.3 }}>
                          🧂 {saltG.toFixed(1)}g
                        </span>
                        <span style={{
                          display: "inline-block", padding: "1px 7px", borderRadius: 4,
                          background: `${catCol}18`, color: catCol,
                          fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
                        }}>
                          {catLabel}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{t.cal}</div>
                        <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 0.5 }}>kcal</div>
                      </div>
                      <button onClick={() => addFood(t)} style={{
                        width: 28, height: 28, borderRadius: 6, background: "#1B5E20", border: "none",
                        color: "#FFFFFF", fontSize: 20, fontWeight: 300, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0,
                      }}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Show what's been added this session */}
          {logs[meal].length > 0 && (
            <div style={panel}>
              <div style={panelHdr}>
                <span style={panelTitle}>{meal}の記録</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(sum(logs[meal], "cal"))} kcal
                </span>
              </div>
              {logs[meal].map(f => (
                <div key={f.uid}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, borderBottom: "1px solid #F3F4F6" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{f.name}</span>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>{f.qty}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums", minWidth: 56, textAlign: "right" }}>
                    {f.cal} kcal
                  </div>
                  <button onClick={() => removeFood(meal, f.uid)} style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: "transparent", border: "1px solid #FCA5A5",
                    color: "#DC2626", fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: 6,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUMMARY TAB ── */}
      {tab === "summary" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <div style={panel}>
            <div style={panelHdr}><span style={panelTitle}>栄養素摂取状況</span></div>
            <div style={{ padding: "0 16px" }}>
              <MetricRow label="エネルギー" value={totals.cal} unit="kcal" goal={goals.cal} />
              <Divider /><MetricRow label="タンパク質" value={totals.protein} unit="g" goal={goals.protein} />
              <Divider /><MetricRow label="脂質" value={totals.fat} unit="g" goal={goals.fat} />
              <Divider /><MetricRow label="炭水化物" value={totals.carb} unit="g" goal={goals.carb} />
              <Divider /><MetricRow label="食物繊維" value={totals.fiber} unit="g" goal={goals.fiber} />
              <Divider /><MetricRow label="ナトリウム" value={totals.na} unit="mg" goal={goals.na} />
            </div>
          </div>

          {/* PFC */}
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>PFCバランス</span>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>推奨 P13-20% / F20-30% / C50-65%</span>
            </div>
            <div style={{ padding: 16 }}>
              {(() => {
                const pcalP = totals.protein * 4, pcalF = totals.fat * 9, pcalC = totals.carb * 4;
                const tot = pcalP + pcalF + pcalC || 1;
                const pP = (pcalP / tot * 100).toFixed(1), pF = (pcalF / tot * 100).toFixed(1), pC = (pcalC / tot * 100).toFixed(1);
                return (
                  <>
                    <div style={{ display: "flex", height: 20, borderRadius: 4, overflow: "hidden", gap: 1 }}>
                      <div style={{ width: `${pP}%`, background: "#2563EB", transition: "width 0.8s" }} />
                      <div style={{ width: `${pF}%`, background: "#D97706", transition: "width 0.8s" }} />
                      <div style={{ width: `${pC}%`, background: "#059669", transition: "width 0.8s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                      {[{ l: "タンパク質", p: pP, c: "#2563EB", cal: pcalP }, { l: "脂質", p: pF, c: "#D97706", cal: pcalF }, { l: "炭水化物", p: pC, c: "#059669", cal: pcalC }].map(x => (
                        <div key={x.l} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 0.5, marginBottom: 2 }}>{x.l}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: x.c, fontVariantNumeric: "tabular-nums" }}>{x.p}<span style={{ fontSize: 12 }}>%</span></div>
                          <div style={{ fontSize: 10, color: "#9CA3AF" }}>{Math.round(x.cal)} kcal</div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Meal bars */}
          <div style={panel}>
            <div style={panelHdr}><span style={panelTitle}>食事別カロリー</span></div>
            <div style={{ padding: "8px 16px 12px" }}>
              {MEAL_SLOTS.map((slot, i) => {
                const cal = sum(logs[slot], "cal"), p = pct(cal, goals.cal);
                const cols = ["#FBBF24", "#34D399", "#60A5FA", "#F87171"];
                return (
                  <div key={slot} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>{slot}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums" }}>
                        {Math.round(cal)} kcal
                        <span style={{ color: "#9CA3AF", fontWeight: 400, marginLeft: 4 }}>({p.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: cols[i], width: `${p}%`, transition: "width 0.6s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div style={{ ...panel, marginBottom: 0 }}>
            <div style={panelHdr}>
              <span style={panelTitle}>摂取食品一覧</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{allItems.length}件</span>
            </div>
            {allItems.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "#9CA3AF", fontSize: 12 }}>記録なし</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["食品名", "食事", "kcal", "P(g)", "F(g)", "C(g)"].map(h => (
                        <th key={h} style={{ padding: "6px 10px", textAlign: h === "食品名" || h === "食事" ? "left" : "right", color: "#6B7280", fontWeight: 600, fontSize: 10, letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MEAL_SLOTS.flatMap(slot => logs[slot].map(f => (
                      <tr key={f.uid} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "7px 10px", color: "#374151", whiteSpace: "nowrap" }}>{f.name}</td>
                        <td style={{ padding: "7px 10px", color: "#9CA3AF", fontSize: 11 }}>{slot}</td>
                        {[f.cal, f.protein, f.fat, f.carb].map((v, i) => (
                          <td key={i} style={{ padding: "7px 10px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#374151" }}>{fmt(v)}</td>
                        ))}
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Drink summary */}
          {drinks.length > 0 && (
            <div style={panel}>
              <div style={panelHdr}><span style={panelTitle}>💧 飲み物サマリー</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#E5E7EB" }}>
                {[
                  { label: "水分量", val: `${drinkTotals.ml}`, unit: "ml", col: "#2563EB" },
                  { label: "カフェイン", val: `${fmt(drinkTotals.caffeine)}`, unit: "mg", col: "#7C3AED" },
                  { label: "糖分", val: `${fmt(drinkTotals.sugar)}`, unit: "g", col: "#DC2626" },
                ].map(({ label, val, unit, col }) => (
                  <div key={label} style={{ background: "#FFFFFF", padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums" }}>{val}</div>
                    <div style={{ fontSize: 9, color: "#CBD5E1" }}>{unit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div style={{ padding: "12px 16px" }}>
            <button onClick={saveToHistory} style={{
              width: "100%", padding: "14px", borderRadius: 10,
              border: "none", background: "#111827",
              color: "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", letterSpacing: 0.5,
              transition: "opacity 0.15s",
            }}>📥 本日のデータを保存</button>
          </div>
        </div>
      )}

      {/* ── GOALS TAB ── */}
      {tab === "goals" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>目標値設定</span>
              {editGoals ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ border: "1px solid #FCA5A5", borderRadius: 8, background: "#FFFFFF", color: "#DC2626", fontSize: 12, fontWeight: 600, padding: "5px 12px", cursor: "pointer" }}
                    onClick={() => setEditGoals(false)}>キャンセル</button>
                  <button style={{ border: "none", borderRadius: 8, background: "#111827", color: "#FFF", fontSize: 12, fontWeight: 600, padding: "5px 12px", cursor: "pointer" }}
                    onClick={() => { setGoals({ ...tmpGoals }); setEditGoals(false); }}>保存</button>
                </div>
              ) : (
                <button style={{ border: "1px solid #E5E7EB", borderRadius: 8, background: "#FFFFFF", color: "#374151", fontSize: 12, fontWeight: 600, padding: "5px 12px", cursor: "pointer" }}
                  onClick={() => { setTmpGoals({ ...goals }); setEditGoals(true); }}>編集</button>
              )}
            </div>
            <div style={{ padding: "0 16px" }}>
              {[
                { key: "cal", label: "エネルギー", unit: "kcal", note: "基礎代謝＋活動量" },
                { key: "protein", label: "タンパク質", unit: "g", note: "体重×1.0〜2.0g目安" },
                { key: "fat", label: "脂質", unit: "g", note: "総エネルギーの20〜30%" },
                { key: "carb", label: "炭水化物", unit: "g", note: "総エネルギーの50〜65%" },
                { key: "fiber", label: "食物繊維", unit: "g", note: "成人推奨値 21g/日以上" },
                { key: "na", label: "ナトリウム", unit: "mg", note: "食塩換算 6g/日未満" },
              ].map(({ key, label, unit, note }, i, arr) => (
                <div key={key}>
                  <div style={{ display: "flex", alignItems: "center", padding: "12px 0", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{label}</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{note}</div>
                    </div>
                    {editGoals ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input type="number" value={tmpGoals[key]}
                          onChange={e => setTmpGoals(g => ({ ...g, [key]: Number(e.target.value) }))}
                          style={{ width: 80, padding: "5px 8px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 14, fontWeight: 700, textAlign: "right", color: "#111827", fontFamily: "inherit", outline: "none" }}
                        />
                        <span style={{ fontSize: 11, color: "#9CA3AF", minWidth: 28 }}>{unit}</span>
                      </div>
                    ) : (
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{goals[key]}</span>
                        <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 3 }}>{unit}</span>
                      </div>
                    )}
                  </div>
                  {i < arr.length - 1 && <Divider />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...panel, background: "#F9FAFB" }}>
            <div style={panelHdr}><span style={panelTitle}>目標値の色分け基準</span></div>
            <div style={{ padding: "12px 16px" }}>
              {[
                { col: "#2563EB", range: "〜60%", desc: "摂取不足" },
                { col: "#16A34A", range: "60〜100%", desc: "適切範囲" },
                { col: "#D97706", range: "100〜120%", desc: "若干過剰" },
                { col: "#DC2626", range: "120%〜", desc: "過剰摂取" },
              ].map(({ col, range, desc }) => (
                <div key={range} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: col, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#374151", minWidth: 70, fontVariantNumeric: "tabular-nums" }}>{range}</span>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ── EXERCISE TAB ── */}
      {tab === "exercise" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>

          {/* Body weight input */}
          <div style={{ ...panel, marginTop: 12 }}>
            <div style={panelHdr}>
              <span style={panelTitle}>体重（消費カロリー計算用）</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
              <span style={{ fontSize: 13, color: "#6B7280", flex: 1 }}>現在の体重</span>
              <input type="number" value={bodyWeight}
                onChange={e => setBodyWeight(Number(e.target.value))}
                style={{ width: 72, padding: "5px 8px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 15, fontWeight: 700, textAlign: "right", color: "#111827", fontFamily: "inherit", outline: "none" }}
              />
              <span style={{ fontSize: 13, color: "#9CA3AF" }}>kg</span>
            </div>
          </div>

          {/* Calorie balance panel */}
          <div style={{ ...panel }}>
            <div style={panelHdr}><span style={panelTitle}>カロリー収支</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#E5E7EB", margin: "0" }}>
              {[
                { label: "摂取", val: Math.round(totals.cal), col: "#374151" },
                { label: "消費", val: Math.round(burnedCal), col: "#059669" },
                { label: "純収支", val: Math.round(netCal), col: netCal > goals.cal ? "#DC2626" : "#2563EB" },
              ].map(({ label, val, col }) => (
                <div key={label} style={{ background: "#FFFFFF", padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums" }}>{val}</div>
                  <div style={{ fontSize: 9, color: "#CBD5E1" }}>kcal</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 16px" }}>
              <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  background: netCal > goals.cal ? "#DC2626" : "#16A34A",
                  width: `${Math.min(100, (netCal / goals.cal) * 100)}%`,
                  transition: "width 0.6s",
                }} />
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "right" }}>
                目標 {goals.cal} kcal に対して {Math.round((netCal / goals.cal) * 100)}%
              </div>
            </div>
          </div>

          {/* Exercise search */}
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>運動を追加</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{EXERCISE_DB.length}種目</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #E5E7EB", background: "#FDFDFD" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input value={exQuery} onChange={e => setExQuery(e.target.value)}
                placeholder="運動を検索..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "inherit" }}
              />
              {exQuery && <button onClick={() => setExQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, lineHeight: 1, fontSize: 16 }}>×</button>}
            </div>
            <div style={{ maxHeight: 260, overflowY: "auto" }}>
              {EXERCISE_DB.filter(e => !exQuery.trim() || e.name.includes(exQuery)).map(ex => {
                const mins = exMinutes[ex.id] || 30;
                const burned = Math.round((ex.met * bodyWeight * 3.5 / 200) * mins);
                return (
                  <div key={ex.id}
                    style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, background: hoverEx === ex.id ? "#F9FAFB" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                    onMouseEnter={() => setHoverEx(ex.id)} onMouseLeave={() => setHoverEx(null)}
                  >
                    <div style={{ fontSize: 22, flexShrink: 0 }}>{ex.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{ex.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <input type="number" value={mins}
                          onChange={e => setExMinutes(m => ({ ...m, [ex.id]: Number(e.target.value) }))}
                          style={{ width: 46, padding: "2px 6px", border: "1px solid #E5E7EB", borderRadius: 4, fontSize: 12, fontWeight: 700, textAlign: "right", color: "#374151", fontFamily: "inherit", outline: "none" }}
                        />
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>分</span>
                        <span style={{ fontSize: 11, color: "#059669", fontWeight: 700, fontVariantNumeric: "tabular-nums", marginLeft: 4 }}>
                          −{burned} kcal
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExercises(p => [...p, { ...ex, minutes: mins, burned, uid: Date.now() + Math.random() }])}
                      style={{ width: 28, height: 28, borderRadius: 6, background: "#111827", border: "none", color: "#FFFFFF", fontSize: 20, fontWeight: 300, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0 }}
                    >+</button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logged exercises */}
          {exercises.length > 0 && (
            <div style={panel}>
              <div style={panelHdr}>
                <span style={panelTitle}>本日の運動記録</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", fontVariantNumeric: "tabular-nums" }}>
                  −{Math.round(burnedCal)} kcal
                </span>
              </div>
              {exercises.map(e => (
                <div key={e.uid}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, background: hoverExLog === e.uid ? "#F0FDF4" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={() => setHoverExLog(e.uid)} onMouseLeave={() => setHoverExLog(null)}
                >
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{e.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{e.name}</div>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>{e.minutes}分</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", fontVariantNumeric: "tabular-nums", minWidth: 60, textAlign: "right" }}>
                    −{e.burned} kcal
                  </div>
                  <button onClick={() => setExercises(p => p.filter(x => x.uid !== e.uid))} style={{
                    width: 24, height: 24, borderRadius: 4, background: "transparent", border: "1px solid #FCA5A5",
                    color: "#DC2626", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 6,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <div style={panel}>
            <div style={panelHdr}>
              <span style={panelTitle}>📋 保存済み記録</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{history.length}件</span>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#9CA3AF", fontSize: 12 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>NO HISTORY</div>
                集計タブから記録を保存してください
              </div>
            ) : (
              history.map(entry => {
                const isExpanded = expandedDate === entry.date;
                const netC = entry.totals.cal - entry.burnedCal;
                return (
                  <div key={entry.date} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <div
                      onClick={() => setExpandedDate(isExpanded ? null : entry.date)}
                      style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 10, cursor: "pointer", background: isExpanded ? "#F9FAFB" : "transparent", transition: "background 0.1s" }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{entry.date}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#374151", background: "#F3F4F6", padding: "1px 7px", borderRadius: 4 }}>{Math.round(entry.totals.cal)} kcal</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", background: "#2563EB18", padding: "1px 7px", borderRadius: 4 }}>P{fmt(entry.totals.protein)}g</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#D97706", background: "#D9770618", padding: "1px 7px", borderRadius: 4 }}>F{fmt(entry.totals.fat)}g</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#05966918", padding: "1px 7px", borderRadius: 4 }}>C{fmt(entry.totals.carb)}g</span>
                          {entry.drinkTotals.ml > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "1px 7px", borderRadius: 4 }}>💧{entry.drinkTotals.ml}ml</span>}
                        </div>
                      </div>
                      <span style={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0, transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: "0 16px 12px", background: "#FAFAFA" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#E5E7EB", borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
                          {[
                            { label: "摂取", val: Math.round(entry.totals.cal), unit: "kcal" },
                            { label: "消費", val: Math.round(entry.burnedCal), unit: "kcal" },
                            { label: "純収支", val: Math.round(netC), unit: "kcal" },
                          ].map(({ label, val, unit }) => (
                            <div key={label} style={{ background: "#FFFFFF", padding: "8px", textAlign: "center" }}>
                              <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 1 }}>{label}</div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{val}</div>
                              <div style={{ fontSize: 9, color: "#CBD5E1" }}>{unit}</div>
                            </div>
                          ))}
                        </div>
                        {MEAL_SLOTS.filter(s => entry.logs[s]?.length > 0).map(slot => (
                          <div key={slot} style={{ marginBottom: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", letterSpacing: 1, marginBottom: 2, textTransform: "uppercase" }}>{slot}</div>
                            {entry.logs[slot].map((f, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 12, color: "#374151" }}>
                                <span>{f.name}</span>
                                <span style={{ fontVariantNumeric: "tabular-nums", color: "#6B7280" }}>{f.cal}kcal</span>
                              </div>
                            ))}
                          </div>
                        ))}
                        {entry.drinks.length > 0 && (
                          <div style={{ marginBottom: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: 1, marginBottom: 2 }}>💧 飲み物</div>
                            {entry.drinks.map((d, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 12, color: "#374151" }}>
                                <span>{d.name}</span>
                                <span style={{ fontVariantNumeric: "tabular-nums", color: "#6B7280" }}>{d.ml}ml</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {entry.exercises.length > 0 && (
                          <div style={{ marginBottom: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#059669", letterSpacing: 1, marginBottom: 2 }}>🏃 運動</div>
                            {entry.exercises.map((e, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 12, color: "#374151" }}>
                                <span>{e.icon} {e.name} ({e.minutes}分)</span>
                                <span style={{ fontVariantNumeric: "tabular-nums", color: "#059669" }}>−{e.burned}kcal</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <button onClick={() => deleteHistoryEntry(entry.date)} style={{
                          width: "100%", padding: "8px", borderRadius: 6,
                          border: "1px solid #FCA5A5", background: "#FEF2F2",
                          color: "#DC2626", fontSize: 11, fontWeight: 700, cursor: "pointer",
                          fontFamily: "inherit", marginTop: 6,
                        }}>🗑 この記録を削除</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── ALL FOODS TAB ── */}
      {tab === "allfoods" && (() => {
        const allFoodsUnified: (Food & { source: string; sourceCategory?: string })[] = [
          ...FOOD_DB.map(f => ({ ...f, source: "general" as const, sourceCategory: f.category })),
          ...HAMA_SUSHI_DB.map(h => ({ ...h, source: "hamasushi" as const, sourceCategory: `hama_${h.category}`, category: `hama_${h.category}` })),
          ...TONDEN_DB.map(t => ({ ...t, source: "tonden" as const, sourceCategory: `tonden_${t.category}`, category: `tonden_${t.category}` })),
        ];
        const filteredAll = allFoodsUnified.filter(f => {
          const matchCat = allCategory === "all" || f.category === allCategory;
          const matchQ = !allQuery.trim() || f.name.includes(allQuery);
          return matchCat && matchQ;
        });
        const catLabel = (f: typeof allFoodsUnified[0]) => {
          const c = ALL_FOOD_CATEGORIES.find(cat => cat.id === f.category);
          return c ? `${c.icon} ${c.label}` : "";
        };
        const catColor = (cat?: string) => {
          if (!cat) return "#6B7280";
          if (cat === "staple") return "#B45309";
          if (cat === "main") return "#DC2626";
          if (cat === "side") return "#059669";
          if (cat === "vegetable") return "#16A34A";
          if (cat === "soup") return "#2563EB";
          if (cat === "fruit") return "#D97706";
          if (cat === "dairy") return "#7C3AED";
          if (cat?.startsWith("hama_")) return "#EA580C";
          if (cat?.startsWith("tonden_")) return "#1B5E20";
          return "#6B7280";
        };
        return (
          <div style={{ animation: "fadeIn 0.25s ease" }}>
            {/* Meal slot selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px 0" }}>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>追加先：</span>
              {MEAL_SLOTS.map(m => (
                <button key={m} onClick={() => setMeal(m)} style={{
                  padding: "4px 12px", borderRadius: 16,
                  border: `1px solid ${meal === m ? "#111827" : "#E5E7EB"}`,
                  background: meal === m ? "#111827" : "#FFFFFF",
                  color: meal === m ? "#FFFFFF" : "#6B7280",
                  fontSize: 11, fontWeight: meal === m ? 700 : 400,
                  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  transition: "all 0.15s",
                }}>{m}</button>
              ))}
            </div>

            {/* Category filter — 2-row scrollable */}
            <div style={{ padding: "10px 16px 0" }}>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {ALL_FOOD_CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setAllCategory(c.id)} style={{
                    padding: "5px 10px", borderRadius: 16,
                    border: `1px solid ${allCategory === c.id ? "#6366F1" : "#E5E7EB"}`,
                    background: allCategory === c.id ? "#6366F1" : "#FFFFFF",
                    color: allCategory === c.id ? "#FFFFFF" : "#6B7280",
                    fontSize: 10, fontWeight: allCategory === c.id ? 700 : 400,
                    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    transition: "all 0.15s",
                  }}>{c.icon} {c.label}</button>
                ))}
              </div>
            </div>

            {/* Unified food list */}
            <div style={panel}>
              <div style={panelHdr}>
                <span style={{ ...panelTitle, display: "flex", alignItems: "center", gap: 6 }}>📋 全品データベース</span>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{filteredAll.length}/{allFoodsUnified.length}品目</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #E5E7EB", background: "#FDFDFD" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={allQuery}
                  onChange={e => setAllQuery(e.target.value)}
                  placeholder="全品から検索..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#111827", background: "transparent", fontFamily: "inherit" }}
                />
                {allQuery && (
                  <button onClick={() => setAllQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, lineHeight: 1, fontSize: 16 }}>×</button>
                )}
              </div>
              <div style={{ maxHeight: 520, overflowY: "auto" }}>
                {filteredAll.length === 0 && (
                  <div style={{ padding: "24px 0", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>該当する食品が見つかりません</div>
                )}
                {filteredAll.map(f => (
                  <div key={`${f.source}-${f.id}`}
                    style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 8, cursor: "pointer", background: hoverAll === f.id && f.source === "general" ? "#F5F3FF" : hoverAll === f.id ? "#F9FAFB" : "transparent", transition: "background 0.1s", borderBottom: "1px solid #F3F4F6" }}
                    onMouseEnter={() => setHoverAll(f.id)}
                    onMouseLeave={() => setHoverAll(null)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{f.name}</span>
                        <span style={{ fontSize: 10, color: "#9CA3AF" }}>{f.qty}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
                        {[
                          { label: `P ${f.protein}g`, col: "#2563EB" },
                          { label: `F ${f.fat}g`, col: "#D97706" },
                          { label: `C ${f.carb}g`, col: "#059669" },
                        ].map(({ label, col }) => (
                          <span key={label} style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, background: `${col}18`, color: col, fontSize: 10, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                            {label}
                          </span>
                        ))}
                        <span style={{
                          display: "inline-block", padding: "1px 7px", borderRadius: 4,
                          background: `${catColor(f.category)}18`, color: catColor(f.category),
                          fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
                        }}>
                          {catLabel(f)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {f.recipe && (
                        <button onClick={(e) => { e.stopPropagation(); setRecipeModal(f); }} style={{
                          width: 26, height: 26, borderRadius: 6, background: "#F5F3FF", border: "1px solid #DDD6FE",
                          color: "#6366F1", fontSize: 13, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0,
                        }}>📖</button>
                      )}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{f.cal}</div>
                        <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: 0.5 }}>kcal</div>
                      </div>
                      <button onClick={() => addFood(f)} style={{
                        width: 28, height: 28, borderRadius: 6, background: "#6366F1", border: "none",
                        color: "#FFFFFF", fontSize: 20, fontWeight: 300, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0,
                      }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* show logged for current meal */}
            {logs[meal].length > 0 && (
              <div style={panel}>
                <div style={panelHdr}>
                  <span style={panelTitle}>{meal}の記録</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(sum(logs[meal], "cal"))} kcal
                  </span>
                </div>
                {logs[meal].map(f => (
                  <div key={f.uid}
                    style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 10, borderBottom: "1px solid #F3F4F6" }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{f.name}</span>
                      <div style={{ fontSize: 10, color: "#9CA3AF" }}>{f.qty}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums", minWidth: 56, textAlign: "right" }}>
                      {f.cal} kcal
                    </div>
                    <button onClick={() => removeFood(meal, f.uid)} style={{
                      width: 24, height: 24, borderRadius: 4,
                      background: "transparent", border: "1px solid #FCA5A5",
                      color: "#DC2626", fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginLeft: 6,
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "#FFFFFF", borderTop: "1px solid #E5E7EB",
        display: "flex", justifyContent: "space-around",
        padding: "8px 0 16px", zIndex: 30,
      }}>
        {[
          {
            id: "record", label: "記録", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                <path d="M16 3l5 5-9 9H7v-5L16 3z" />
              </svg>
            )
          },
          {
            id: "hamasushi", label: "はま寿司", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <ellipse cx="12" cy="14" rx="10" ry="5" />
                <path d="M6 9c0-3 2.7-6 6-6s6 3 6 6" />
                <path d="M2 14c0 2.8 4.5 5 10 5s10-2.2 10-5" />
              </svg>
            )
          },
          {
            id: "tonden", label: "とんでん", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 20h18" />
                <path d="M5 20V8l7-5 7 5v12" />
                <path d="M9 20v-6h6v6" />
                <path d="M9 11h1" /><path d="M14 11h1" />
              </svg>
            )
          },
          {
            id: "summary", label: "集計", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            )
          },
          {
            id: "goals", label: "目標", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            )
          },
          {
            id: "exercise", label: "運動", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 3a3 3 0 0 0-3 3l-7 3a3 3 0 0 0-1 0L4 8a1 1 0 0 0 0 2l3 1a3 3 0 0 0 1 0l7 3a3 3 0 1 0 .75-1.911l-7-3a3 3 0 0 0 0-.178l7-3A3 3 0 0 0 18 3z" />
              </svg>
            )
          },
          {
            id: "history", label: "履歴", icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            )
          },
          {
            id: "allfoods", label: "全品", icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            )
          },
        ].map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 1, border: "none", background: "none", cursor: "pointer",
            color: tab === id ? (id === "hamasushi" ? "#EA580C" : id === "tonden" ? "#1B5E20" : id === "allfoods" ? "#6366F1" : "#111827") : "#9CA3AF",
            padding: "4px 4px",
            transition: "color 0.15s", minWidth: 0,
          }}>
            {icon}
            <span style={{ fontSize: 8, fontWeight: tab === id ? 700 : 400, whiteSpace: "nowrap" }}>{label}</span>
            {tab === id && <div style={{ width: 3, height: 3, borderRadius: "50%", background: id === "hamasushi" ? "#EA580C" : id === "tonden" ? "#1B5E20" : id === "allfoods" ? "#6366F1" : "#111827" }} />}
          </button>
        ))}
      </div>

      {/* Recipe Modal */}
      {recipeModal && (
        <div onClick={() => setRecipeModal(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, animation: "fadeIn 0.2s ease",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#FFFFFF", borderRadius: 16, maxWidth: 400, width: "100%",
            maxHeight: "80vh", overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          }}>
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              padding: "20px 20px 16px", color: "#FFFFFF",
            }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", opacity: 0.8, marginBottom: 4, fontWeight: 600 }}>📖 RECIPE</div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>{recipeModal.name}</div>
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{recipeModal.qty}</div>
            </div>
            {/* Nutrition chips */}
            <div style={{ display: "flex", gap: 6, padding: "12px 20px", flexWrap: "wrap", borderBottom: "1px solid #F3F4F6" }}>
              <span style={{ padding: "3px 10px", borderRadius: 20, background: "#111827", color: "#FFF", fontSize: 11, fontWeight: 700 }}>{recipeModal.cal} kcal</span>
              <span style={{ padding: "3px 10px", borderRadius: 20, background: "#2563EB18", color: "#2563EB", fontSize: 11, fontWeight: 700 }}>P {recipeModal.protein}g</span>
              <span style={{ padding: "3px 10px", borderRadius: 20, background: "#D9770618", color: "#D97706", fontSize: 11, fontWeight: 700 }}>F {recipeModal.fat}g</span>
              <span style={{ padding: "3px 10px", borderRadius: 20, background: "#05966918", color: "#059669", fontSize: 11, fontWeight: 700 }}>C {recipeModal.carb}g</span>
            </div>
            {/* Recipe steps */}
            <div style={{ padding: "16px 20px 20px", overflowY: "auto", maxHeight: "45vh" }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10, fontWeight: 700 }}>作り方</div>
              {recipeModal.recipe?.split("\n").map((line, i) => (
                <div key={i} style={{
                  padding: line.startsWith("💡") ? "8px 12px" : "4px 0",
                  fontSize: line.startsWith("💡") ? 11 : 13,
                  color: line.startsWith("💡") ? "#6366F1" : "#374151",
                  lineHeight: 1.6,
                  background: line.startsWith("💡") ? "#F5F3FF" : "transparent",
                  borderRadius: line.startsWith("💡") ? 8 : 0,
                  marginTop: line.startsWith("💡") ? 8 : 0,
                  fontWeight: line.startsWith("💡") ? 600 : 400,
                }}>
                  {line || <br />}
                </div>
              ))}
            </div>
            {/* Close + Add */}
            <div style={{ display: "flex", gap: 10, padding: "0 20px 20px" }}>
              <button onClick={() => setRecipeModal(null)} style={{
                flex: 1, padding: "12px", borderRadius: 10,
                border: "1px solid #E5E7EB", background: "#FFFFFF",
                color: "#6B7280", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>閉じる</button>
              <button onClick={() => { addFood(recipeModal); setRecipeModal(null); }} style={{
                flex: 1, padding: "12px", borderRadius: 10,
                border: "none", background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                color: "#FFFFFF", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>+ {meal}に追加</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "#111827", color: "#FFFFFF", padding: "10px 24px",
          borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 50,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "fadeIn 0.25s ease",
        }}>{toast}</div>
      )}

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#E5E7EB;border-radius:2px}
      `}</style>
    </div>
  );
}
