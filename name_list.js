let nameList1 = [
"friendly"
,"shy"
,"kind"
,"mean"
,"honest"
,"faithful"
,"polite"
,"serious"
,"smart"
,"clever"
,"intelligent"
,"funny"
,"interesting"
,"unique"
,"entertaining"
,"nervous"
,"patient"
,"thoughtful"
,"childish"
,"selfish"
,"innocent"
,"talkative"
,"stupid"
,"lazy"
,"loose"
,"evil"
,"brave"
,"jealous"
,"sensitive"
,"responsible"
,"cheerul"
,"fussy"
,"passive"
,"gentle"
,"laid back"
,"open"
,"methodical"
,"fickle"
,"timid"
,"cold-hearted"
,"cautious"
,"disciplined"
,"hasty"
,"childlike"
,"clumsy"
,"persistent"
,"earnest"
,"pessimisitic"
,"considerate"
,"competitive"
,"straightforward"
,"diligent"
,"mature"
,"nasty"
,"stubborn"
,"ambitious"
,"moody"
,"reliable"
,"aggressive"
,"competitive"
,"independent"
,"sociable"
,"immature"
,"ignorant"
,"forgetful"
,"progressive"
,"conservative"
,"enthusiastic"
,"a patriot"
,"thorough"
,"genius"
,"peace-loving"
,"a sweetheart"
,"creative"
,"free-spirited"
,"trustworthy"
,"a busy bee"
,"masculine"
,"feminine"
,"optimistic"
,"secretive"
,"dogmatic"
,"frank"
,"loud"
,"nerd"
,"negative"
,"coy"
,"passive"
,"introvert"
,"close-minded"
,"chicken"
,"busybody"
,"wild"
,"bull-spirited"
,"strong-spirited"
,"a father figure"
,"outgoing"
,"neat"
,"quiet"
,"calm"
,"cool"
,"obedient"
,"concerned"
,"warm"
,"well-mannered"
,"positive"
,"a go-getter"
,"active"
,"frisky"
];//109個

let nameList2 = [
"black bear"
,"bat"
,"bear"
,"beaver"
,"blue whale"
,"boar"
,"brown bear"
,"buffalo"
,"bull"
,"calf"
,"camel"
,"cat"
,"chimpanzee"
,"civet"
,"cow"
,"deer"
,"dog"
,"dolphin"
,"donkey"
,"dormouse"
,"dugong"//ジュゴン
,"elephant"//象"
,"flying squirrel"//ムササビ
,"fox"//キツネ
,"fur seal"//オットセイ"
,"giraffe"//キリン"
,"goat"//ヤギ"
,"gorilla"//ゴリラ"
,"hamster"//ハムスター"
,"hare"//野ウサギ"
,"hedgehog"//ハリネズミ"
,"horse"//馬"
,"humpback whale"//ザトウクジラ"
,"kangaroo"//カンガルー"
,"killer whale"//シャチ"
,"kitten"//子猫"
,"koala"//コアラ"
,"lamb"//子羊"
,"leopard"//ヒョウ"
,"lion"//ライオン"
,"mare"//メスの馬、メスのロバ"
,"minke whale"//ミンククジラ"
,"mole"//モグラ"
,"momonga"//モモンガ"
,"mongoose"//マングース"
,"monkey"//猿"
,"mouse"//小型のネズミ"
,"mule"//ラバ"
,"otter"//カワウソ"
,"panda"//パンダ"
,"panther"//黒ヒョウ
,"penguin"//ペンギン
,"pig"//豚
,"polar bear"//ホッキョクグマ
,"pony"//（小型馬の）ポニー
,"rabbit"//ウサギ
,"raccoon"//アライグマ
,"raccoon dog"//タヌキ
,"ram"//（去勢されていない）オスの羊
,"rat"//大型のネズミ
,"reindeer"//トナカイ
,"right whale"//セミクジラ
,"sea lion"//アシカ
,"sea otter"//ラッコ
,"seal"//アザラシ
,"sheep"//羊
,"sperm whale"//マッコウクジラ
,"squirrel"//リス
,"tiger"//虎
,"walrus"//セイウチ
,"weasel"//イタチ
,"whale"//クジラ
,"wolf"//狼
,"zebra"//
,"albatross"//アホウドリ
,"bull-headed shrike"//モズ
,"canary"//カナリア
,"chicken"//ニワトリ
,"cock"//雄鶏（おんどり）
,"crane"//ツル
,"crow"//カラス
,"cuckoo"//カッコウ
,"dove"//ハト
,"duck"//カモ、アヒル
,"eagle"//ワシ
,"egret"//シラサギ
,"falcon"//ハヤブサ
,"fowl"//鶏。家禽（かきん）
,"goose"//（雌の）ガチョウ、ガン
,"hawk"//タカ
,"hen"//雌鳥（めんどり）
,"ibis"//トキ
,"bush warbler"//ウグイス
,"white-eye"//メジロ
,"kingfisher"//
,"meadow bunting"//ホオジロ
,"ostrich"//ダチョウ
,"owl"//フクロウ
,"parakeet"//インコ
,"peacock"//（オスの）クジャク
,"pelican"//ペリカン
,"peregrine falcon"//ハヤブサ
,"petrel"//ウミツバメ
,"pheasant"//キジ
,"pigeons"//ハト
,"plover"//チドリ
,"quail"//ウズラ
,"raven"//大型のカラス、ワタリガラス
,"robin"//コマツグミ。ヨーロッパコマドリ
,"seagull"//カモメ
,"skylark"//ヒバリ
,"sparrow"//スズメ
,"starling"//ムクドリ
,"stork"//コウノトリ
,"swallow"//ツバメ
,"swan"//白鳥
,"swan"//ハクチョウ
,"turkey"//七面鳥
,"woodpecker"//
,"alfonsino"//キンメダイ
,"ayu"//アユ
,"bass"//スズキ
,"black bass"//ブラックバス
,"blowfish"//フグ
,"bonito"//カツオ
,"carp"//コイ
,"catfish"//ナマズ
,"codfish"//タラ
,"crucian carp"//フナ
,"dolphinfish"//シイラ
,"eel"//ウナギ
,"flounder"//カレイ
,"goby"//ハゼ
,"goldfish"//金魚
,"greater amberjack"//カンパチ
,"herring"//ニシン
,"horse mackerel"//アジ
,"loach"//ドジョウ
,"mackerel"//サバ
,"marlin"//カジキ
,"Okhotsk mackerel"//ホッケ
,"ray"//エイ
,"rockfish"//メバル
,"rockfish"//カサゴ
,"sablefish"//ギンダラ
,"salmon"//サケ
,"sand borer"//キス
,"sardine"//イワシ
,"saury"//サンマ
,"sea eel"//アナゴ
,"shark"//鮫（さめ）
,"shishamo smelt"//シシャモ
,"smelt"//ワカサギ
,"spanish mackerel"//サワラ
,"sunfish"//マンボウ
,"threadsail filefish"//カワハギ
,"tilefish"//アマダイ
,"trout"//マス
,"trout"//トラウト
,"tuna"//マグロ
,"yellowtail"//ブリ
,"ant"//アリ
,"balm cricket"//セミ
,"bee"//ミツバチ
,"beetle"//カブトムシ
,"butterfly"//蝶（ちょう）
,"cabbage butterfly"//モンシロチョウ
,"carpenter bee"//クマバチ
,"caterpillar"//いも虫、毛虫
,"coccinella"//ナナホシテントウ
,"cockroach"//ゴキブリ
,"cricket"//コオロギ
,"diving beetle"//ゲンゴロウ
,"dorcus"//オオクワガタ
,"dragonfly"//トンボ
,"earwig"//ハサミムシ
,"ephemera"//カゲロウ
,"firefly"//ホタル
,"flea"//ノミ
,"gold beetle"//コガネムシ
,"grasshopper"//バッタ、イナゴ
,"ladybug"//テントウムシ
,"lice"//シラミ
,"locust"//バッタ
,"long-horned beetle"//カミキリムシ
,"moth"//蛾（が）
,"paper wasp"//アシナガバチ
,"praying mantis"//カマキリ
,"sawtoothed stag beetle"//ノコギリクワガ
,"slug"//ナメクジ
,"snail"//カタツムリ
,"spider"//クモ
,"stag beetle"//クワガタムシ
,"stick insect"//ナナフシ
,"stink bugs"//カメムシ
,"swallowtail butterfly"//アゲハチョウ
,"wasp"//スズメバチ
,"white ant"
,"alligator"//アリゲーター
,"caiman"//カイマン
,"cobra"//コブラ
,"crocodile"//クロコダイル
,"gecko"//ヤモリ
,"habu"//ハブ
,"hawksbill turtle"//タイマイ
,"house lizard"//ヤモリ
,"iguana"//イグアナ
,"lizard"//トカゲ
,"pit viper"//マムシ
,"sea snake"//ウミヘビ
,"sea turtle"//ウミガメ
,"serpent"//蛇
,"snake"//蛇
,"snapping turtle"//カミツキガメ
,"soft-shelled turtle"//スッポン
,"turtle"//亀
,"rog"//カエル
,"newt"//イモリ
,"salamander"//サンショウウオ
,"toad"//ヒキガエル
,"tree frog"//アマガエル
];//222個

exports.getNiceName = () => {
	let i = Math.floor(Math.random() * 108);
	let j = Math.floor(Math.random() * 221);
	let niceName = nameList1[i] + " " + nameList2[j];
	if(niceName.length < 24){
		return niceName;
	}else{
		return nameList1[i] + " " + nameList2[j];
	}
}

