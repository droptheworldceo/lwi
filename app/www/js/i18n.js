// 다국어(한/영/중/일/베) UI 시스템. 사용자 게시글·채널명 등 UGC는 번역하지 않고
// 앱 인터페이스(메뉴·버튼·안내문구)만 번역한다 — 기획 결정 사항.
window.LWI = window.LWI || {};

window.LWI.LANGS = [
  { code: "ko", native: "한국어" },
  { code: "en", native: "English" },
  { code: "zh", native: "中文" },
  { code: "ja", native: "日本語" },
  { code: "vi", native: "Tiếng Việt" }
];

var DICT = {
  common: {
    kindExperience: ["경험담", "Experience", "经验分享", "体験談", "Kinh nghiệm"],
    kindEvidence: ["근거자료", "Evidence", "参考资料", "根拠資料", "Tài liệu tham khảo"],
    anonymous: ["익명", "Anonymous", "匿名", "匿名", "Ẩn danh"],
    empathyLabel: ["저도 그래요", "Me too", "我也是", "私も", "Tôi cũng vậy"],
    commentsWord: ["댓글", "comments", "评论", "コメント", "bình luận"]
  },
  nav: {
    home: ["홈", "Home", "首页", "ホーム", "Trang chủ"],
    community: ["커뮤니티", "Community", "社区", "コミュニティ", "Cộng đồng"],
    write: ["글쓰기", "Write", "发布", "投稿", "Viết bài"],
    me: ["나", "Me", "我", "マイページ", "Của tôi"]
  },
  auth: {
    tagline: [
      "누구나 질병을 안고 살아갑니다. 서로의 경험을 나누는 공감 커뮤니티",
      "Everyone lives with some illness. A community for sharing experience and empathy.",
      "每个人都在与疾病共存。这是一个分享经验、彼此共鸣的社区。",
      "誰もが何らかの病気を抱えて生きています。経験を分かち合う共感コミュニティ。",
      "Ai cũng sống chung với bệnh tật. Cộng đồng chia sẻ kinh nghiệm và đồng cảm."
    ],
    tabSignup: ["가입하기", "Sign up", "注册", "新規登録", "Đăng ký"],
    tabLogin: ["로그인", "Log in", "登录", "ログイン", "Đăng nhập"],
    emailLabel: ["이메일", "Email", "邮箱", "メールアドレス", "Email"],
    passwordLabel: ["비밀번호", "Password", "密码", "パスワード", "Mật khẩu"],
    passwordPlaceholder: ["8자 이상", "At least 8 characters", "8位以上", "8文字以上", "Ít nhất 8 ký tự"],
    privacyNote: [
      "유병장수는 의료행위를 중개·알선하지 않는 정보 공유 목적의 서비스입니다. 가입 시 이메일 인증이 필요합니다. 인증된 이메일은 어뷰징 방지 목적에만 쓰이며, 닉네임을 포함해 프로필의 어떤 화면에도 공개되지 않습니다.",
      "LWI is an information-sharing service and does not broker or arrange medical treatment. Email verification is required to sign up. Your verified email is used only to prevent abuse and is never shown anywhere in your profile, including your nickname.",
      "LWI是信息分享服务，不进行医疗行为的中介或介绍。注册时需要邮箱验证。已验证的邮箱仅用于防止滥用，不会在个人资料的任何页面（包括昵称）中公开。",
      "LWIは医療行為を仲介・斡旋しない情報共有目的のサービスです。登録時にはメール認証が必要です。認証されたメールは不正利用防止のみに使用され、ニックネームを含むプロフィールのどの画面にも公開されません。",
      "LWI là dịch vụ chia sẻ thông tin, không môi giới hay sắp xếp hoạt động y tế. Cần xác minh email khi đăng ký. Email đã xác minh chỉ được dùng để ngăn chặn lạm dụng và không bao giờ hiển thị ở bất kỳ đâu trong hồ sơ, kể cả biệt danh."
    ],
    errEmailInUse: ["이미 가입된 이메일이에요. 로그인 탭을 이용해주세요.", "This email is already registered. Please use the Log in tab.", "该邮箱已注册，请使用登录标签。", "このメールは既に登録されています。ログインタブをご利用ください。", "Email này đã được đăng ký. Vui lòng dùng tab đăng nhập."],
    errWeakPassword: ["비밀번호가 너무 짧아요. 8자 이상 입력해주세요.", "Password is too short. Please use at least 8 characters.", "密码太短，请输入至少8位。", "パスワードが短すぎます。8文字以上入力してください。", "Mật khẩu quá ngắn. Vui lòng nhập ít nhất 8 ký tự."],
    errInvalidEmail: ["이메일 형식을 확인해주세요.", "Please check your email format.", "请检查邮箱格式。", "メールの形式をご確認ください。", "Vui lòng kiểm tra định dạng email."],
    errWrongPassword: ["이메일 또는 비밀번호가 일치하지 않아요.", "Email or password doesn't match.", "邮箱或密码不正确。", "メールまたはパスワードが一致しません。", "Email hoặc mật khẩu không đúng."],
    errGeneric: ["문제가 발생했어요. 잠시 후 다시 시도해주세요.", "Something went wrong. Please try again shortly.", "出现问题，请稍后重试。", "問題が発生しました。しばらくしてから再度お試しください。", "Đã xảy ra lỗi. Vui lòng thử lại sau."],
    notConfigured: ["Firebase 설정이 아직 연결되지 않았습니다.", "Firebase isn't connected yet.", "Firebase尚未连接。", "Firebase設定がまだ接続されていません。", "Firebase chưa được kết nối."]
  },
  verify: {
    title: ["이메일 인증이 필요해요", "Email verification needed", "需要邮箱验证", "メール認証が必要です", "Cần xác minh email"],
    desc: [
      "위 주소로 인증 메일을 보냈어요. 메일함(스팸함 포함)에서 링크를 눌러 인증을 완료해주세요. 인증한 이메일은 어디에도 공개되지 않아요.",
      "We sent a verification email to the address above. Please check your inbox (including spam) and click the link to verify. Your verified email is never shown anywhere.",
      "我们已向上方地址发送了验证邮件。请检查收件箱（包括垃圾邮件），点击链接完成验证。已验证的邮箱不会公开。",
      "上記のアドレスに認証メールを送信しました。受信箱（迷惑メールフォルダも含む）でリンクをクリックして認証を完了してください。認証済みのメールはどこにも公開されません。",
      "Chúng tôi đã gửi email xác minh đến địa chỉ trên. Vui lòng kiểm tra hộp thư (kể cả spam) và nhấp vào liên kết để xác minh. Email đã xác minh sẽ không được hiển thị ở bất kỳ đâu."
    ],
    checkBtn: ["인증 완료했어요, 확인하기", "I've verified, check now", "已完成认证，检查一下", "認証完了、確認する", "Tôi đã xác minh, kiểm tra ngay"],
    resendBtn: ["인증 메일 다시 보내기", "Resend verification email", "重新发送验证邮件", "認証メールを再送信", "Gửi lại email xác minh"],
    signoutBtn: ["다른 계정으로 시작하기", "Start with a different account", "使用其他账户开始", "別のアカウントで始める", "Bắt đầu với tài khoản khác"],
    statusChecking: ["확인 중...", "Checking...", "确认中...", "確認中...", "Đang kiểm tra..."],
    statusNotVerified: ["아직 인증되지 않았어요. 메일함을 확인해주세요.", "Not verified yet. Please check your inbox.", "尚未验证，请检查邮箱。", "まだ認証されていません。メールボックスをご確認ください。", "Chưa xác minh. Vui lòng kiểm tra hộp thư."],
    resendSending: ["전송 중...", "Sending...", "发送中...", "送信中...", "Đang gửi..."],
    resendSent: ["다시 보냈어요. 잠시 후 메일함을 확인해주세요.", "Sent again. Please check your inbox shortly.", "已重新发送，请稍后查看邮箱。", "再送信しました。しばらくしてからメールボックスをご確認ください。", "Đã gửi lại. Vui lòng kiểm tra hộp thư sau ít phút."],
    resendFail: ["전송에 실패했어요.", "Failed to send.", "发送失败。", "送信に失敗しました。", "Gửi thất bại."]
  },
  nickname: {
    titleHtml: ["어떤 이름으로<br>활동하시겠어요?", "What name would<br>you like to use?", "想以什么<br>名字活动？", "どんな名前で<br>活動しますか？", "Bạn muốn dùng<br>tên nào?"],
    desc: [
      "실명 대신 쓸 닉네임이에요. 언제든 마이페이지에서 바꿀 수 있어요.",
      "A nickname to use instead of your real name. You can change it anytime in My Page.",
      "这是代替真实姓名使用的昵称，随时可以在个人页面修改。",
      "実名の代わりに使うニックネームです。いつでもマイページで変更できます。",
      "Đây là biệt danh thay cho tên thật. Bạn có thể đổi bất cứ lúc nào trong Trang cá nhân."
    ],
    label: ["닉네임", "Nickname", "昵称", "ニックネーム", "Biệt danh"],
    placeholder: ["예: 고요한하루", "e.g. QuietDay", "例：宁静的一天", "例：静かな一日", "Ví dụ: NgàyYênBình"],
    submit: ["시작하기", "Get started", "开始使用", "はじめる", "Bắt đầu"],
    errShort: ["2자 이상 입력해주세요.", "Please enter at least 2 characters.", "请输入至少2个字符。", "2文字以上入力してください。", "Vui lòng nhập ít nhất 2 ký tự."]
  },
  home: {
    pointsLabel: ["내 포인트", "My points", "我的积分", "マイポイント", "Điểm của tôi"],
    checkinQ: ["오늘 컨디션은 어떠세요?", "How are you feeling today?", "今天感觉怎么样？", "今日の体調はどうですか？", "Hôm nay bạn cảm thấy thế nào?"],
    checkinBtn: ["체크인하고 포인트 받기", "Check in & earn points", "打卡领积分", "チェックインしてポイント獲得", "Check-in để nhận điểm"],
    streak: ["{n}일 연속 체크인", "{n}-day streak", "连续{n}天打卡", "{n}日連続チェックイン", "Chuỗi {n} ngày"],
    streakZero: ["오늘부터 시작해요", "Start today", "从今天开始", "今日から始めよう", "Bắt đầu từ hôm nay"],
    earnToast: ["+{n}P 적립!", "+{n}P earned!", "+{n}积分！", "+{n}P獲得！", "+{n}P đã nhận!"],
    doneText: [
      "{n}일 연속 체크인 중이에요. 내일 또 만나요!",
      "You're on a {n}-day streak. See you tomorrow!",
      "已连续打卡{n}天，明天见！",
      "{n}日連続チェックイン中です。また明日！",
      "Bạn đang có chuỗi {n} ngày. Hẹn gặp lại ngày mai!"
    ],
    moodTough: ["힘듦", "Tough", "难受", "つらい", "Khó chịu"],
    moodTired: ["피곤", "Tired", "疲惫", "疲れた", "Mệt mỏi"],
    moodNormal: ["보통", "Okay", "一般", "普通", "Bình thường"],
    moodGood: ["좋음", "Good", "不错", "良い", "Tốt"],
    badge_streak_7: ["7일 연속 달성", "7-day streak", "连续7天达成", "7日連続達成", "Đạt chuỗi 7 ngày"],
    badge_streak_15: ["15일 연속 달성", "15-day streak", "连续15天达成", "15日連続達成", "Đạt chuỗi 15 ngày"],
    badge_streak_30: ["30일 연속 달성", "30-day streak", "连续30天达成", "30日連続達成", "Đạt chuỗi 30 ngày"],
    badge_streak_100: ["100일 연속 달성", "100-day streak", "连续100天达成", "100日連続達成", "Đạt chuỗi 100 ngày"]
  },
  channels: {
    title: ["채널", "Channels", "频道", "チャンネル", "Kênh"],
    mainChannels: ["메인 채널", "Main channels", "主要频道", "メインチャンネル", "Kênh chính"],
    subChannels: ["서브 채널", "Sub channels", "子频道", "サブチャンネル", "Kênh phụ"],
    empty: ["아직 없어요.", "Nothing here yet.", "暂时还没有。", "まだありません。", "Chưa có gì ở đây."],
    join: ["참여하기", "Join", "加入", "参加する", "Tham gia"],
    joined: ["참여중", "Joined", "已加入", "参加中", "Đã tham gia"],
    memberCountShort: ["{n}명", "{n}", "{n}人", "{n}人", "{n} người"],
    newChannelPlaceholder: ["원하는 질병 이름으로 채널 만들기", "Create a channel by disease name", "以疾病名称创建频道", "病名でチャンネルを作成", "Tạo kênh theo tên bệnh"],
    newChannelBtn: ["만들기", "Create", "创建", "作成", "Tạo"],
    newChannelNote: [
      "참여자가 많아지면 메인 채널로 승격될 수 있어요.",
      "Popular channels get promoted to main channels.",
      "参与人数增多后可能升级为主要频道。",
      "参加者が増えるとメインチャンネルに昇格することがあります。",
      "Kênh có nhiều người tham gia có thể được nâng cấp thành kênh chính."
    ],
    promoLabel: ["메인 채널 승격까지 {n}명", "{n} more to become a main channel", "还差{n}人升级为主要频道", "メインチャンネル昇格まであと{n}人", "Còn {n} người nữa để thành kênh chính"],
    promoReady: [
      "메인 채널 승격 조건을 채웠어요 · 검토 중",
      "Promotion criteria met · under review",
      "已满足升级条件·审核中",
      "昇格条件を満たしました・確認中",
      "Đã đủ điều kiện nâng cấp · đang xem xét"
    ]
  },
  channel: {
    latest: ["최신순", "Latest", "最新", "新着順", "Mới nhất"],
    archive: ["함께 시도해본 것들", "Things people tried", "大家试过的方法", "みんなが試したこと", "Những điều mọi người đã thử"],
    memberCountFull: ["{n}명 참여 중", "{n} members", "{n}人参与中", "{n}人参加中", "{n} người tham gia"],
    emptyLatest: [
      "아직 이 채널엔 이야기가 없어요. 첫 이야기를 남겨보세요.",
      "No stories in this channel yet. Share the first one.",
      "这个频道还没有故事，来发布第一个吧。",
      "このチャンネルにはまだストーリーがありません。最初の投稿をしてみましょう。",
      "Kênh này chưa có câu chuyện nào. Hãy chia sẻ câu chuyện đầu tiên."
    ],
    emptyArchive: [
      "아직 공감을 받은 이야기가 없어요.",
      "No stories with empathy yet.",
      "还没有获得共鸣的故事。",
      "まだ共感を得たストーリーがありません。",
      "Chưa có câu chuyện nào nhận được sự đồng cảm."
    ],
    archiveRank: ["{n}위", "#{n}", "第{n}名", "{n}位", "Hạng {n}"]
  },
  write: {
    title: ["이야기 남기기", "Share a story", "发布故事", "ストーリーを投稿", "Chia sẻ câu chuyện"],
    channelLabel: ["채널", "Channel", "频道", "チャンネル", "Kênh"],
    kindExperienceDesc: ["내가 직접 겪은 이야기", "A story from my own experience", "我的亲身经历", "自分の体験談", "Câu chuyện từ trải nghiệm của tôi"],
    kindEvidenceDesc: ["출처가 있는 정보", "Information with a source", "有来源的信息", "出典のある情報", "Thông tin có nguồn tham khảo"],
    sourceLabel: ["출처", "Source", "出处", "出典", "Nguồn"],
    sourcePlaceholder: ["예: OO병원 칼럼, 논문명 등", "e.g. hospital column, paper title", "例：某医院专栏、论文名称等", "例：〇〇病院コラム、論文名など", "Ví dụ: chuyên mục bệnh viện, tên nghiên cứu"],
    bodyLabel: ["내용", "Content", "内容", "内容", "Nội dung"],
    bodyPlaceholder: [
      "같은 병을 겪는 사람들에게 전하고 싶은 이야기를 편하게 적어주세요.",
      "Write freely for others going through the same illness.",
      "请自由地写下想对同病相怜的人说的话。",
      "同じ病気を経験している人に伝えたいことを自由に書いてください。",
      "Hãy viết thoải mái điều bạn muốn chia sẻ với những người cùng bệnh."
    ],
    disclaimer: [
      "유병장수는 의료행위를 중개·알선하지 않는 정보 공유 목적의 서비스입니다. 이 내용은 병원 치료를 대체하지 않으며, \"최초\", \"유일\", \"100% 치료\", \"부작용 없음\"처럼 의학적 진단·효능을 단정하는 표현은 게시할 수 없습니다.",
      "LWI is an information-sharing service and does not broker or arrange medical treatment. This content does not replace hospital care, and phrases claiming definite medical effect (e.g. \"first\", \"only\", \"100% cure\", \"no side effects\") cannot be posted.",
      "LWI是信息分享服务，不进行医疗行为的中介或介绍。此内容不能替代医院治疗，且不得发布\"首创\"\"唯一\"\"100%治愈\"\"无副作用\"等断言医学效果的表达。",
      "LWIは医療行為を仲介・斡旋しない情報共有目的のサービスです。この内容は病院での治療に代わるものではなく、「最初」「唯一」「100%治療」「副作用なし」など医学的効能を断定する表現は投稿できません。",
      "LWI là dịch vụ chia sẻ thông tin, không môi giới hay sắp xếp hoạt động y tế. Nội dung này không thay thế điều trị tại bệnh viện, và không được đăng các cụm từ khẳng định hiệu quả y học như \"đầu tiên\", \"duy nhất\", \"chữa khỏi 100%\", \"không tác dụng phụ\"."
    ],
    submit: ["올리기", "Post", "发布", "投稿する", "Đăng"],
    uploading: ["사진 업로드 중...", "Uploading photo...", "正在上传照片...", "写真をアップロード中...", "Đang tải ảnh lên..."],
    posting: ["올리는 중...", "Posting...", "发布中...", "投稿中...", "Đang đăng..."],
    errShort: ["10자 이상 적어주세요.", "Please write at least 10 characters.", "请输入至少10个字符。", "10文字以上入力してください。", "Vui lòng nhập ít nhất 10 ký tự."],
    errBanned: [
      "\"{term}\"는 의학적 효능을 단정하는 표현이라 게시할 수 없어요. 문구를 수정해주세요.",
      "\"{term}\" claims a definite medical effect and can't be posted. Please rephrase.",
      "\"{term}\"属于断定医学效果的表达，无法发布。请修改措辞。",
      "「{term}」は医学的効能を断定する表現のため投稿できません。表現を修正してください。",
      "\"{term}\" là cụm từ khẳng định hiệu quả y học nên không thể đăng. Vui lòng chỉnh sửa."
    ],
    imageAdd: ["사진 추가 (선택)", "Add photo (optional)", "添加照片（可选）", "写真を追加（任意）", "Thêm ảnh (tùy chọn)"],
    imageTooLarge: ["사진은 5MB 이하로 올려주세요.", "Please upload a photo under 5MB.", "请上传5MB以下的照片。", "写真は5MB以下でアップロードしてください。", "Vui lòng tải ảnh dưới 5MB."],
    errGeneric: ["문제가 발생했어요. 다시 시도해주세요.", "Something went wrong. Please try again.", "出现问题，请重试。", "問題が発生しました。もう一度お試しください。", "Đã xảy ra lỗi. Vui lòng thử lại."]
  },
  post: {
    disclaimer: [
      "유병장수는 의료행위를 중개·알선하지 않는 정보 공유 목적의 서비스입니다. 이 내용은 개인 경험 또는 참고 정보이며, 병원 치료를 대체하지 않습니다.",
      "LWI is an information-sharing service and does not broker or arrange medical treatment. This is personal experience or reference information, not a replacement for hospital care.",
      "LWI是信息分享服务，不进行医疗行为的中介或介绍。此内容为个人经验或参考信息，不能替代医院治疗。",
      "LWIは医療行為を仲介・斡旋しない情報共有目的のサービスです。この内容は個人の経験または参考情報であり、病院での治療に代わるものではありません。",
      "LWI là dịch vụ chia sẻ thông tin, không môi giới hay sắp xếp hoạt động y tế. Đây là kinh nghiệm cá nhân hoặc thông tin tham khảo, không thay thế điều trị tại bệnh viện."
    ],
    empathyWithCount: ["저도 그래요 · {n}", "Me too · {n}", "我也是 · {n}", "私も · {n}", "Tôi cũng vậy · {n}"],
    commentPlaceholder: ["따뜻한 댓글을 남겨보세요", "Leave a warm comment", "写下温暖的留言", "温かいコメントを残しましょう", "Để lại bình luận ấm áp"],
    commentSubmit: ["남기기", "Post", "发布", "送信", "Gửi"],
    emptyComments: ["아직 댓글이 없어요.", "No comments yet.", "还没有评论。", "まだコメントがありません。", "Chưa có bình luận nào."],
    hiddenNotice: [
      "신고가 누적되어 숨김 처리된 게시글입니다.",
      "This post has been hidden due to reports.",
      "此帖子因被举报过多已被隐藏。",
      "通報の蓄積により非表示になった投稿です。",
      "Bài viết này đã bị ẩn do nhận nhiều báo cáo."
    ],
    reportLink: ["신고", "Report", "举报", "通報", "Báo cáo"],
    sourcePrefix: ["출처: {source}", "Source: {source}", "出处：{source}", "出典：{source}", "Nguồn: {source}"],
    commentBanned: [
      "\"{term}\"는 의학적 효능을 단정하는 표현이라 남길 수 없어요.",
      "\"{term}\" claims a definite medical effect and can't be posted in a comment.",
      "\"{term}\"属于断定医学效果的表达，无法作为评论发布。",
      "「{term}」は医学的効能を断定する表現のためコメントに残せません。",
      "\"{term}\" khẳng định hiệu quả y học nên không thể để lại trong bình luận."
    ]
  },
  profile: {
    title: ["마이페이지", "My Page", "我的页面", "マイページ", "Trang cá nhân"],
    statCheckins: ["기록 일수", "Days logged", "记录天数", "記録日数", "Số ngày ghi"],
    statPosts: ["쓴 이야기", "Stories written", "发布的故事", "投稿数", "Câu chuyện đã viết"],
    statChannels: ["참여 채널", "Channels joined", "参与频道", "参加チャンネル", "Kênh đã tham gia"],
    myChannelsTitle: ["참여 중인 채널", "Channels I'm in", "正在参与的频道", "参加中のチャンネル", "Kênh đang tham gia"],
    myChannelsEmpty: [
      "아직 참여한 채널이 없어요 · 둘러보기",
      "No channels yet · Explore",
      "还没有加入频道·去看看",
      "まだ参加チャンネルがありません・探す",
      "Chưa tham gia kênh nào · Khám phá"
    ],
    myPostsTitle: ["내가 쓴 이야기", "Stories I wrote", "我写的故事", "自分の投稿", "Câu chuyện của tôi"],
    myPostsEmpty: ["아직 쓴 이야기가 없어요.", "No stories written yet.", "还没有发布故事。", "まだ投稿がありません。", "Chưa viết câu chuyện nào."],
    blockedTitle: ["차단한 사용자", "Blocked users", "已屏蔽用户", "ブロックしたユーザー", "Người dùng đã chặn"],
    blockedEmpty: ["차단한 사용자가 없어요.", "No blocked users.", "暂无屏蔽用户。", "ブロックしたユーザーはいません。", "Không có người dùng nào bị chặn."],
    unblock: ["차단 해제", "Unblock", "取消屏蔽", "ブロック解除", "Bỏ chặn"],
    settingsLink: ["설정", "Settings", "设置", "設定", "Cài đặt"],
    guestLabel: ["게스트로 이용 중", "Using as guest", "以访客身份使用中", "ゲストとして利用中", "Đang dùng dưới dạng khách"],
    backupCta: ["이메일로 기록 백업하기", "Back up with email", "用邮箱备份记录", "メールで記録をバックアップ", "Sao lưu bằng email"],
    signout: ["로그아웃", "Log out", "退出登录", "ログアウト", "Đăng xuất"],
    save: ["저장", "Save", "保存", "保存", "Lưu"],
    myPostMeta: ["{channel} · 공감 {n}", "{channel} · {n} empathy", "{channel} · {n}个共鸣", "{channel} · 共感{n}", "{channel} · {n} đồng cảm"]
  },
  search: {
    title: ["검색", "Search", "搜索", "検索", "Tìm kiếm"],
    placeholder: [
      "채널 이름이나 이야기 내용으로 검색",
      "Search by channel name or story content",
      "按频道名称或故事内容搜索",
      "チャンネル名やストーリー内容で検索",
      "Tìm theo tên kênh hoặc nội dung câu chuyện"
    ],
    emptyPrompt: [
      "궁금한 질병이나 키워드를 입력해보세요.",
      "Try searching a disease or keyword.",
      "试着输入疾病名称或关键词。",
      "気になる病気やキーワードを入力してみてください。",
      "Hãy thử tìm bệnh hoặc từ khóa."
    ],
    channelsLabel: ["채널", "Channels", "频道", "チャンネル", "Kênh"],
    storiesLabel: ["이야기", "Stories", "故事", "ストーリー", "Câu chuyện"],
    noResults: [
      "\"{q}\"에 대한 결과가 없어요.",
      "No results for \"{q}\".",
      "没有找到与\"{q}\"相关的结果。",
      "「{q}」に関する結果がありません。",
      "Không có kết quả cho \"{q}\"."
    ]
  },
  settings: {
    title: ["설정", "Settings", "设置", "設定", "Cài đặt"],
    langTitle: ["언어", "Language", "语言", "言語", "Ngôn ngữ"],
    langDesc: ["사용할 언어를 선택해주세요.", "Choose your language.", "请选择使用语言。", "使用する言語を選択してください。", "Chọn ngôn ngữ bạn muốn sử dụng."],
    notifTitle: ["알림 기능 준비 중", "Notifications coming soon", "通知功能开发中", "通知機能準備中", "Tính năng thông báo sắp ra mắt"],
    notifDesc: [
      "댓글·공감 알림 기능은 아직 준비 중이라, 지금은 앱에 직접 들어와 확인해주셔야 해요.",
      "Comment and empathy notifications aren't ready yet — please check the app directly for now.",
      "评论和共鸣通知功能尚在开发中，请直接打开应用查看。",
      "コメント・共感の通知機能はまだ準備中のため、今はアプリに直接アクセスしてご確認ください。",
      "Tính năng thông báo bình luận và đồng cảm chưa sẵn sàng — hiện tại vui lòng vào ứng dụng để kiểm tra trực tiếp."
    ],
    dangerTitle: ["계정 삭제", "Delete account", "删除账户", "アカウント削除", "Xóa tài khoản"],
    dangerDesc: [
      "계정을 삭제하면 로그인 정보와 프로필(닉네임, 참여 채널, 체크인 기록)이 영구히 사라지고 되돌릴 수 없습니다. 이미 작성하신 게시글·댓글은 커뮤니티 기록으로 남아 삭제되지 않습니다 (닉네임 표기만 유지).",
      "Deleting your account permanently removes your login and profile (nickname, joined channels, check-in history) and cannot be undone. Posts and comments you've already written stay as community records and won't be deleted (only the nickname label remains).",
      "删除账户将永久删除您的登录信息和个人资料（昵称、参与频道、打卡记录），且无法恢复。您已发布的帖子和评论将作为社区记录保留，不会被删除（仅保留昵称显示）。",
      "アカウントを削除すると、ログイン情報とプロフィール（ニックネーム、参加チャンネル、チェックイン記録）が完全に削除され、元に戻せません。すでに投稿した内容・コメントはコミュニティの記録として残り、削除されません（ニックネーム表記のみ維持）。",
      "Xóa tài khoản sẽ vĩnh viễn xóa thông tin đăng nhập và hồ sơ (biệt danh, kênh đã tham gia, lịch sử check-in) và không thể khôi phục. Bài viết và bình luận bạn đã viết vẫn được giữ lại làm hồ sơ cộng đồng và không bị xóa (chỉ giữ lại tên hiển thị)."
    ],
    deleteBtn: ["계정 삭제하기", "Delete account", "删除账户", "アカウントを削除", "Xóa tài khoản"],
    confirmDesc: [
      "본인 확인을 위해 비밀번호를 다시 입력해주세요.",
      "Please re-enter your password to confirm.",
      "请重新输入密码以确认身份。",
      "本人確認のためパスワードを再入力してください。",
      "Vui lòng nhập lại mật khẩu để xác nhận."
    ],
    passwordPlaceholder: ["비밀번호", "Password", "密码", "パスワード", "Mật khẩu"],
    cancel: ["취소", "Cancel", "取消", "キャンセル", "Hủy"],
    deleteConfirm: ["영구 삭제", "Delete permanently", "永久删除", "完全に削除", "Xóa vĩnh viễn"],
    errPasswordRequired: ["비밀번호를 입력해주세요.", "Please enter your password.", "请输入密码。", "パスワードを入力してください。", "Vui lòng nhập mật khẩu."],
    errWrongPassword: ["비밀번호가 일치하지 않아요.", "That password isn't correct.", "密码不正确。", "パスワードが一致しません。", "Mật khẩu không đúng."],
    errGeneric: ["삭제 중 문제가 발생했어요.", "Something went wrong while deleting.", "删除时出现问题。", "削除中に問題が発生しました。", "Đã xảy ra lỗi khi xóa."]
  },
  sheet: {
    reportTitle: ["신고하기", "Report", "举报", "通報する", "Báo cáo"],
    reasonSpam: ["스팸·광고", "Spam or ads", "垃圾信息·广告", "スパム・広告", "Spam hoặc quảng cáo"],
    reasonAbuse: ["욕설·혐오 표현", "Abusive or hateful language", "辱骂·仇恨言论", "暴言・ヘイト表現", "Ngôn từ lăng mạ, thù ghét"],
    reasonMisinfo: ["잘못된 의료정보", "Incorrect medical information", "错误医疗信息", "誤った医療情報", "Thông tin y tế sai lệch"],
    reasonPrivacy: ["개인정보 노출", "Personal information exposed", "暴露个人信息", "個人情報の露出", "Lộ thông tin cá nhân"],
    reasonEtc: ["기타", "Other", "其他", "その他", "Khác"],
    otherTitle: ["기타", "Other", "其他", "その他", "Khác"],
    blockAuthor: ["작성자 차단하기", "Block this author", "屏蔽作者", "投稿者をブロック", "Chặn người viết"],
    cancel: ["취소", "Cancel", "取消", "キャンセル", "Hủy"],
    reportSuccess: [
      "신고가 접수됐어요. 검토 후 조치할게요.",
      "Report received. We'll review and take action.",
      "举报已提交，我们会审核处理。",
      "通報を受け付けました。確認の上対応します。",
      "Đã nhận báo cáo. Chúng tôi sẽ xem xét và xử lý."
    ],
    blockSuccess: ["{name}님을 차단했어요.", "Blocked {name}.", "已屏蔽{name}。", "{name}さんをブロックしました。", "Đã chặn {name}."]
  }
};

var LANG_INDEX = { ko: 0, en: 1, zh: 2, ja: 3, vi: 4 };

window.LWI.getLang = function () {
  return localStorage.getItem("lwi_lang") || "ko";
};

window.LWI.setLang = function (code) {
  localStorage.setItem("lwi_lang", code);
};

// key는 "namespace.key" 형식. vars는 {"{name}": "값"} 치환용.
window.LWI.t = function (key, vars) {
  var parts = key.split(".");
  var group = DICT[parts[0]];
  var entry = group && group[parts[1]];
  var idx = LANG_INDEX[window.LWI.getLang()];
  var str = entry ? (entry[idx] || entry[0]) : key;
  if (vars) {
    Object.keys(vars).forEach(function (k) {
      str = str.split(k).join(vars[k]);
    });
  }
  return str;
};

window.LWI.applyI18n = function (root) {
  root = root || document;
  root.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = window.LWI.t(el.getAttribute("data-i18n"));
  });
  root.querySelectorAll("[data-i18n-html]").forEach(function (el) {
    el.innerHTML = window.LWI.t(el.getAttribute("data-i18n-html"));
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    el.setAttribute("placeholder", window.LWI.t(el.getAttribute("data-i18n-placeholder")));
  });
};

document.addEventListener("DOMContentLoaded", function () {
  window.LWI.applyI18n(document);
});
