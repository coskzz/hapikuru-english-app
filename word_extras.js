// ===== Word Extras (例文・語源・関連語) =====
// キー: 単語の小文字
// example: 印象的な例文（日本語訳付き）
// etymology: 語源（語根・接頭辞の解説）
// related: 関連語（同語根・派生語）

const WORD_EXTRAS = {
  'vulnerable': {
    example: 'The kitten looked so vulnerable that even the tough soldier burst into tears.\n（その子猫はあまりにも傷つきやすそうで、屈強な兵士さえも泣き崩れた。）',
    etymology: '語根 vulnus（ラテン語：傷）＋ -able → 「傷を受けやすい」',
    related: ['vulnerability（脆弱性）', 'invulnerable（傷つかない）'],
  },
  'heed': {
    example: 'She heeded her doctor\'s warning and quit eating midnight ramen — a true miracle.\n（彼女は医者の警告に注意して深夜ラーメンをやめた — 奇跡だ。）',
    etymology: '古英語 hēdan（注意する）→ そのまま現代英語へ',
    related: ['heedless（不注意な）', 'heedlessly（不注意に）'],
  },
  'bystander': {
    example: 'A random bystander caught the falling wedding cake and somehow saved the ceremony.\n（通りすがりの傍観者がウェディングケーキを受け止め、式を救った。）',
    etymology: 'by（そば）＋ stander（立っている人）→ 「そばに立つ人」',
    related: ['bystander effect（傍観者効果）', 'onlooker（見物人）', 'spectator（観客）'],
  },
  'congestion': {
    example: 'The traffic congestion was so bad that a driver finished an entire novel during the commute.\n（渋滞があまりにひどく、通勤中に小説を一冊読み終えた運転手がいた。）',
    etymology: '接頭辞 con-（共に）＋ gestus（運ぶ）→ 「ぎゅうぎゅうに詰め込む」',
    related: ['congest（混雑させる）', 'congested（混雑した）', 'decongest（解消する）'],
  },
  'discard': {
    example: 'He discarded his pride and asked his rival for help — that was the bravest thing he ever did.\n（彼はプライドを捨てライバルに助けを求めた — それが彼の最も勇気ある行動だった。）',
    etymology: '接頭辞 dis-（離れて）＋ card（カード）→ カードゲームで「カードを捨てる」から',
    related: ['disposal（処分）', 'discard pile（捨て山）', 'abandon（放棄する）'],
  },
  'clumsy': {
    example: 'The clumsy magician accidentally made his assistant disappear — and couldn\'t bring her back.\n（不器用な手品師は助手を誤って消してしまい、戻せなくなった。）',
    etymology: '古ノルド語 klumse（感覚が麻痺した）→ 「動きが鈍い、ぶきっちょな」',
    related: ['clumsily（不器用に）', 'clumsiness（不器用さ）'],
  },
  'eliminate': {
    example: 'The team eliminated all distractions — including the office cat — to meet the deadline.\n（チームは締め切りに間に合わせるため、オフィスの猫も含め全ての邪魔を取り除いた。）',
    etymology: '接頭辞 e-（外へ）＋ limen（ラテン語：敷居）→ 「敷居の外へ追い出す」',
    related: ['elimination（排除）', 'eliminator（排除するもの）'],
  },
  'acknowledge': {
    example: 'He finally acknowledged that his GPS was wrong — three hours after driving into the ocean.\n（海に突っ込んで3時間後、彼はついにGPSが間違っていたことを認めた。）',
    etymology: 'ac-（強調）＋ knowledge（知識）→ 「知識として受け入れる」',
    related: ['acknowledgment（認識）', 'unacknowledged（認められていない）'],
  },
  'edible': {
    example: 'The chef declared the mystery mushroom edible — technically, he survived to tell the tale.\n（シェフは謎のキノコを食べられると宣言した — 一応、彼は生き延びて話せた。）',
    etymology: 'ラテン語 edibilis（食べられる）← edere（食べる）',
    related: ['inedible（食べられない）', 'edibility（可食性）'],
  },
  'cultivate': {
    example: 'She cultivated a talent for sleeping through alarms — truly a skill for the ages.\n（彼女は目覚まし時計を寝過ごす才能を磨いた — 時代を超えたスキルだ。）',
    etymology: 'ラテン語 cultus（耕す）← colere（耕す）',
    related: ['cultivation（耕作）', 'culture（文化）', 'agricultural（農業の）'],
  },
  'reluctant': {
    example: 'The reluctant hero saved the world but complained about it the entire time.\n（気が進まなかったヒーローは世界を救ったが、その間ずっとぼやいていた。）',
    etymology: 're-（逆に）＋ luctari（格闘する）→ 「逆らいながら引き返そうとする」',
    related: ['reluctance（気乗りしなさ）', 'reluctantly（しぶしぶ）'],
  },
  'fragile': {
    example: 'The label said "FRAGILE" but the delivery man treated it like a football.\n（ラベルには「壊れ物」と書かれていたが、配達員はそれをサッカーボールのように扱った。）',
    etymology: 'ラテン語 fragilis（壊れやすい）← frangere（壊す）',
    related: ['fragility（壊れやすさ）', 'fragment（破片）', 'fracture（骨折）'],
  },
  'evaluate': {
    example: 'The professor evaluated his student\'s essay as "creative" — a polite way of saying "bizarre."\n（教授は学生の論文を「創造的」と評価した — 「奇妙」の丁寧な言い方だ。）',
    etymology: 'e-（外へ）＋ value（価値）→ 「価値を取り出す」',
    related: ['evaluation（評価）', 'evaluator（評価者）', 'value（価値）'],
  },
  'weary': {
    example: 'He was so weary from the meeting that he fell asleep mid-handshake.\n（会議でとても疲れていたため、握手の最中に眠ってしまった。）',
    etymology: '古英語 wērig（疲れた）→ wear（疲れさせる）と同語根',
    related: ['weariness（疲れ）', 'wearily（疲れて）', 'tiresome（疲れさせる）'],
  },
  'enforce': {
    example: 'The new law was enforced so strictly that even jaywalking got you a fine.\n（新しい法律は厳しく施行されたため、無断横断でさえ罰金を取られた。）',
    etymology: 'en-（強める）＋ force（力）→ 「力で押しつける」',
    related: ['enforcement（施行）', 'enforcer（実施者）', 'force（力）'],
  },
  'thrive': {
    example: 'Somehow, the cactus thrived in the bathroom — it had found its true home.\n（なぜかサボテンはバスルームで繁栄した — 本当の家を見つけたのだ。）',
    etymology: '古ノルド語 þrífask（自分自身のためにつかむ）→ 「活発に成長する」',
    related: ['thriving（繁栄している）', 'prosperity（繁栄）', 'flourish（栄える）'],
  },
  'accelerate': {
    example: 'The rocket accelerated so fast that the pilot\'s face looked like a blowfish.\n（ロケットはあまりにも速く加速したため、パイロットの顔がフグみたいになった。）',
    etymology: 'ac-（強調）＋ celer（ラテン語：速い）→ 「速さを増す」',
    related: ['acceleration（加速）', 'accelerator（アクセル）', 'decelerate（減速する）'],
  },
  'decay': {
    example: 'His enthusiasm for jogging decayed within three days — a personal record.\n（ジョギングへの熱意が3日で腐敗した — 個人最短記録だ。）',
    etymology: 'de-（下に）＋ cadere（ラテン語：落ちる）→ 「落ちて崩れる」',
    related: ['decaying（腐敗する）', 'decayed（腐った）', 'decompose（分解する）'],
  },
  'bribe': {
    example: 'She bribed her brother with pizza to keep him quiet about the broken vase.\n（花瓶を割ったことを黙らせようと、ピザで弟に賄賂を渡した。）',
    etymology: '古フランス語 briber（物乞いをする）→ 転じて「不正に得た物」',
    related: ['bribery（収賄）', 'briber（賄賂を贈る人）', 'corruption（腐敗）'],
  },
  'explicit': {
    example: 'The instruction manual was so explicit that even the dog could assemble the furniture.\n（説明書はあまりに明示的だったため、犬でも家具を組み立てられた。）',
    etymology: 'ex-（外へ）＋ plicare（折る）→ 「折りたたんだものを広げて見せる」',
    related: ['explicitly（明示的に）', 'explicit content（成人向けコンテンツ）', 'implicitly（暗黙的に）'],
  },
  'lenient': {
    example: 'The lenient judge let the man off with a warning for stealing thirty-seven sandwiches.\n（寛大な裁判官はサンドイッチ37個を盗んだ男に警告だけで済ませた。）',
    etymology: 'ラテン語 lenire（和らげる）← lenis（柔らかい）',
    related: ['leniency（寛大さ）', 'leniently（寛大に）', 'lenience（温情）'],
  },
  'contemplate': {
    example: 'He contemplated eating the last cookie for twenty minutes before his sister grabbed it.\n（妹が取る前の20分間、最後のクッキーを食べるかどうかを熟考していた。）',
    etymology: 'con-（強調）＋ templum（神殿）→ 「神殿で深く考える」',
    related: ['contemplation（熟考）', 'contemplative（瞑想的な）'],
  },
  'notorious': {
    example: 'The cat became notorious for knocking glasses off the table — a true criminal mastermind.\n（その猫はグラスをテーブルから落とすことで悪名高くなった — 真の犯罪の天才だ。）',
    etymology: 'ラテン語 notorius（知られた）← notus（知られた）← noscere（知る）',
    related: ['notoriety（悪名）', 'notoriously（悪名高く）', 'notable（注目すべき）'],
  },
  'enhance': {
    example: 'Adding hot sauce enhanced the flavor — and also enhanced the speed at which he ran to the restroom.\n（ホットソースは風味を高めた — そしてトイレへ向かうスピードも高めた。）',
    etymology: 'en-（強める）＋ altus（ラテン語：高い）→ 「高める」',
    related: ['enhancement（向上）', 'enhanced（強化された）'],
  },
  'vivid': {
    example: 'Her vivid description of the ghost made everyone sleep with the lights on.\n（彼女の幽霊の鮮明な描写のせいで、みんなが電気をつけたまま眠った。）',
    etymology: 'ラテン語 vividus（生き生きした）← vivere（生きる）',
    related: ['vividly（鮮明に）', 'vividness（鮮明さ）', 'vivacious（活発な）'],
  },
  'conform': {
    example: 'He refused to conform and wore pajamas to the board meeting — surprisingly, no one objected.\n（彼は従うことを拒み、取締役会にパジャマで出席したが、驚くことに誰も反対しなかった。）',
    etymology: 'con-（共に）＋ forma（形）→ 「形を合わせる」',
    related: ['conformity（従順）', 'nonconformist（非従順者）', 'conformation（配置）'],
  },
  'trivial': {
    example: 'What started as a trivial argument about pizza toppings lasted three days.\n（ピザのトッピングについてのささいな口論が3日間続いた。）',
    etymology: 'ラテン語 trivium（三叉路）→ 交差点で雑談する「ありふれた話」',
    related: ['trivially（ささいに）', 'triviality（些細さ）', 'trivialize（軽視する）'],
  },
  'vicious': {
    example: 'The dog looked vicious, but was actually afraid of butterflies.\n（その犬は凶暴に見えたが、実は蝶が怖かった。）',
    etymology: 'ラテン語 vitiosus（欠陥のある）← vitium（欠陥・悪）',
    related: ['viciously（凶暴に）', 'viciousness（凶暴さ）', 'vice（悪徳）'],
  },
  'corrupt': {
    example: 'The corrupt official claimed all the gold was for "administrative purposes."\n（腐敗した役人は金塊はすべて「行政目的」だと主張した。）',
    etymology: 'cor-（完全に）＋ rumpere（壊す）→ 「完全に壊す」',
    related: ['corruption（腐敗）', 'corrupted（腐敗した）', 'incorruptible（腐敗しない）'],
  },
  'spontaneous': {
    example: 'Their spontaneous road trip ended when they realized no one had brought a map or money.\n（自発的なロードトリップは、地図もお金も誰も持っていないことに気づいて終わった。）',
    etymology: 'ラテン語 sponte（自らの意志で）→ 「自発的に起こる」',
    related: ['spontaneously（自発的に）', 'spontaneity（自発性）'],
  },
  'adequate': {
    example: 'His cooking was adequate — in the sense that it was technically food.\n（彼の料理は十分だった — 一応食べ物ではあるという意味で。）',
    etymology: 'ad-（に）＋ aequus（ラテン語：等しい）→ 「必要に等しい」',
    related: ['adequately（十分に）', 'inadequate（不十分な）', 'inadequacy（不十分さ）'],
  },
  'obstacle': {
    example: 'The biggest obstacle to his diet was the pizza shop directly beneath his apartment.\n（ダイエットの最大の障害は、アパートのすぐ下にあるピザ屋だった。）',
    etymology: 'ob-（前に）＋ stare（立つ）→ 「前に立ちはだかるもの」',
    related: ['obstruct（妨げる）', 'obstruction（妨害）', 'obstacle course（障害物競走）'],
  },
  'mandatory': {
    example: 'Attendance was mandatory, yet somehow the teacher forgot to show up herself.\n（出席は義務的だったが、なんと先生自身が来るのを忘れた。）',
    etymology: 'ラテン語 mandatum（命令された）← mandare（命じる）',
    related: ['mandate（命令する）', 'mandatory training（義務研修）', 'compulsory（強制的な）'],
  },
  'optimistic': {
    example: 'He remained optimistic even while the ship was sinking, saying "free swimming lessons!"\n（船が沈む中も楽観的で、「無料の水泳レッスンだ！」と言い続けた。）',
    etymology: 'optimus（ラテン語：最善の）→ 「最善の見方をする」',
    related: ['optimism（楽観主義）', 'optimist（楽観主義者）', 'pessimistic（悲観的な）'],
  },
  'perspective': {
    example: 'From the ant\'s perspective, the crumb was a life-changing meal.\n（アリの見方からすれば、そのパン屑は人生を変える食事だった。）',
    etymology: 'per-（通して）＋ specere（見る）→ 「見通すこと」',
    related: ['perspective drawing（透視図）', 'prospective（将来の）', 'retrospective（回顧的な）'],
  },
  'halt': {
    example: 'The marathon runner halted when he realized he\'d been running in the wrong direction for an hour.\n（マラソン選手は1時間逆方向に走っていたことに気づき、停止した。）',
    etymology: '古高ドイツ語 haltan（立ち止まる）→ stop の堅い表現',
    related: ['halting（たどたどしい）', 'halt sign（停止標識）'],
  },
  'abundant': {
    example: 'The island had abundant coconuts, which were great until everyone got tired of coconut everything.\n（島にはヤシの実が豊富だったが、ヤシ尽くしに全員が飽きるまでは良かった。）',
    etymology: 'ab-（から）＋ unda（波）→ 「波のように溢れる」',
    related: ['abundance（豊富さ）', 'abundantly（豊富に）'],
  },
  'integrate': {
    example: 'The robot tried to integrate into human society but kept referring to lunch as "fuel intake."\n（ロボットは人間社会に溶け込もうとしたが、昼食を「燃料補給」と呼び続けた。）',
    etymology: 'integer（ラテン語：完全な）→ 「完全にする」',
    related: ['integration（統合）', 'integer（整数）', 'disintegrate（分解する）'],
  },
  'prestigious': {
    example: 'The prestigious award went to a film that no one actually understood.\n（名声のある賞は、誰も実際には理解していない映画に贈られた。）',
    etymology: 'フランス語 prestige（幻惑）← ラテン語 praestigium（手品）',
    related: ['prestige（名声）', 'prestigious university（名門大学）'],
  },
  'portray': {
    example: 'The actor portrayed a detective so convincingly that police kept asking for his ID.\n（俳優は刑事をあまりに説得力をもって描写したため、警察が何度も身分証を確認した。）',
    etymology: '古フランス語 portraire（前面を引き出す）→ 「描写する」',
    related: ['portrayal（描写）', 'portrait（肖像画）', 'portrait photographer（肖像写真家）'],
  },
  'dedicated': {
    example: 'She was so dedicated to her work that she replied to emails during her own wedding.\n（仕事に献身的すぎて、自分の結婚式中もメールを返信していた。）',
    etymology: 'de-（完全に）＋ dicare（宣言する）→ 「完全に捧げる」',
    related: ['dedication（献身）', 'dedicate（捧げる）', 'devotion（献身）'],
  },
  'compulsory': {
    example: 'Compulsory exercise was introduced, and the office hamster set a new speed record.\n（強制体操が導入され、オフィスのハムスターが新記録を出した。）',
    etymology: 'com-（共に）＋ pellere（駆り立てる）→ 「強制して行わせる」',
    related: ['compulsion（強迫）', 'compel（強いる）', 'mandatory（義務的な）'],
  },
  'contaminate': {
    example: 'The single droplet of hot sauce contaminated the entire batch of ice cream — accidentally amazing.\n（ホットソースの一滴がアイスクリーム全部を汚染した — 偶然にも驚くほどおいしかった。）',
    etymology: 'con-（共に）＋ tangere（触れる）→ 「汚れに触れさせる」',
    related: ['contamination（汚染）', 'contaminant（汚染物質）', 'decontaminate（除染する）'],
  },
  'comply': {
    example: 'He complied with every rule — except the one about not bringing pets, because the iguana was his emotional support.\n（イグアナがEサポート動物だからという理由でペット禁止以外の全ルールに従った。）',
    etymology: 'com-（共に）＋ plere（満たす）→ 「要求を満たす」',
    related: ['compliance（コンプライアンス）', 'compliant（従順な）', 'non-compliance（違反）'],
  },
  'abolish': {
    example: 'The king abolished homework — which was popular until the students realized he meant for himself.\n（王様は宿題を廃止した — 自分用だと分かるまでは人気だった。）',
    etymology: 'ab-（離れて）＋ olere（育つ）→ 「成長を止める」→ 廃止する',
    related: ['abolition（廃止）', 'abolitionist（廃止論者）'],
  },
  'prominent': {
    example: 'The prominent scientist was famous for her discovery and her collection of rubber ducks.\n（著名な科学者は、発見とゴム製のアヒルコレクションで有名だった。）',
    etymology: 'pro-（前に）＋ minere（突き出る）→ 「前に突き出た」',
    related: ['prominence（卓越）', 'prominently（目立って）'],
  },
  'chronic': {
    example: 'His chronic lateness became so predictable that meetings were scheduled an hour later just for him.\n（慢性的な遅刻があまりにも予測可能になったため、会議は彼のために1時間遅くなった。）',
    etymology: 'ギリシャ語 chronos（時間）→ 「長い時間にわたる」',
    related: ['chronically（慢性的に）', 'chronic disease（慢性病）', 'chronicle（年代記）'],
  },
  'inevitable': {
    example: 'It was inevitable that the two cats would fight over the one sunny spot in the house.\n（家の中でたった一つの日当たりの良い場所を巡って二匹の猫が争うのは避けられなかった。）',
    etymology: 'in-（否定）＋ evitabilis（避けられる）← evitare（避ける）',
    related: ['inevitably（必然的に）', 'inevitability（必然性）'],
  },
  'vague': {
    example: 'His directions were so vague that the taxi driver ended up in a different country.\n（彼の道案内があいまいすぎて、タクシー運転手は別の国に到着してしまった。）',
    etymology: 'ラテン語 vagus（さまよう）→ 「はっきりしない」',
    related: ['vaguely（漠然と）', 'vagueness（曖昧さ）', 'vague answer（曖昧な返答）'],
  },
  'suppress': {
    example: 'She suppressed her laughter during the serious speech — and failed spectacularly.\n（真剣なスピーチ中に笑いを抑えようとしたが、見事に失敗した。）',
    etymology: 'sub-（下に）＋ premere（押す）→ 「押さえつける」',
    related: ['suppression（抑制）', 'suppressive（抑制的な）', 'oppress（抑圧する）'],
  },
  'persist': {
    example: 'He persisted in asking the vending machine for his money back for forty-five minutes.\n（自動販売機にお金を返せと45分間しつこく訴え続けた。）',
    etymology: 'per-（完全に）＋ sistere（立つ）→ 「最後まで立ち続ける」',
    related: ['persistence（粘り強さ）', 'persistent（しつこい）', 'perseverance（忍耐）'],
  },
  'inherit': {
    example: 'She inherited her grandfather\'s love of jazz — and his extremely loud playing at midnight.\n（祖父のジャズ愛を受け継いだ — そして深夜の爆音演奏も。）',
    etymology: 'in-（中に）＋ heres（ラテン語：相続人）→ 「相続人になる」',
    related: ['inheritance（遺産）', 'heir（相続人）', 'hereditary（遺伝的な）'],
  },
  'genuine': {
    example: 'His genuine excitement about spreadsheets worried his colleagues.\n（スプレッドシートに対する彼の本物の興奮は同僚を心配させた。）',
    etymology: 'ラテン語 genuinus（生まれながらの）← genus（生まれ）',
    related: ['genuinely（本当に）', 'genuineness（本物であること）'],
  },
  'conceal': {
    example: 'He tried to conceal the broken lamp by replacing it with a slightly different broken lamp.\n（壊れたランプを少し違う壊れたランプに替えて隠そうとした。）',
    etymology: 'con-（完全に）＋ celare（隠す）→ 「完全に隠す」',
    related: ['concealment（隐蔽）', 'concealed（隠れた）', 'reveal（明かす）'],
  },
  'elaborate': {
    example: 'His excuse was so elaborate that his teacher assumed he had actually written a novel.\n（言い訳があまりに精巧で、先生は彼が小説を書いたと思った。）',
    etymology: 'e-（外へ）＋ laborare（働く）→ 「念入りに仕上げる」',
    related: ['elaboration（詳細）', 'elaborately（念入りに）', 'labor（労働）'],
  },
  'cease': {
    example: 'The alarm ceased only after the neighbor threw a shoe at the window.\n（隣人が窓に靴を投げつけてようやくアラームが止まった。）',
    etymology: 'ラテン語 cessare（止まる）← cedere（退く）',
    related: ['ceasefire（停戦）', 'ceaseless（絶え間ない）', 'incessant（絶えない）'],
  },
  'detect': {
    example: 'The dog detected the hidden treat in 0.3 seconds — faster than the security scanner.\n（犬は0.3秒で隠れたお菓子を発見した — セキュリティスキャナーより速かった。）',
    etymology: 'de-（離れて）＋ tegere（覆う）→ 「覆いを取る」',
    related: ['detection（探知）', 'detective（探偵）', 'detector（探知機）'],
  },
  'restrict': {
    example: 'The diet restricted him to salads, which he immediately began dipping in chocolate.\n（ダイエットでサラダしか食べられなくなったが、彼はすぐチョコレートに浸して食べ始めた。）',
    etymology: 're-（後へ）＋ stringere（締める）→ 「締めつけて制限する」',
    related: ['restriction（制限）', 'restrictive（制限的な）', 'unrestricted（無制限の）'],
  },
  'acquire': {
    example: 'She acquired seventeen houseplants before admitting she had a problem.\n（問題があると認める前に観葉植物を17鉢入手した。）',
    etymology: 'ad-（に）＋ quaerere（求める）→ 「求めて手に入れる」',
    related: ['acquisition（取得）', 'acquired（後天的な）'],
  },
};
