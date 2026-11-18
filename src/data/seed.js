export const CATEGORIES = ['学术讲座', '文体活动', '志愿服务', '创新创业', '社团活动'];

const at = (offset, hour = 14) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export function seedData() {
  const users = [
    { id: 'u-admin', username: 'admin', realName: '平台管理员', role: 'admin', phone: '', college: '校园活动中心', status: 'active', createdAt: at(-30) },
    { id: 'u-student', username: '20260001', realName: '林同学', role: 'student', phone: '13800000001', college: '计算机学院', status: 'active', createdAt: at(-20) },
    { id: 'u-student2', username: '20260002', realName: '陈同学', role: 'student', phone: '13800000002', college: '文学院', status: 'active', createdAt: at(-18) },
    { id: 'u-student3', username: '20260003', realName: '周同学', role: 'student', phone: '', college: '教育学院', status: 'active', createdAt: at(-16) },
    { id: 'u-student4', username: '20260004', realName: '许同学', role: 'student', phone: '', college: '经济与工商管理学院', status: 'active', createdAt: at(-10) },
  ];
  const definitions = [
    ['e-ai', '当人工智能遇见未来', '学术讲座', '计算机学院', '科学会堂 · 一楼报告厅', 7, 120, 'ai', '从大模型到智能体，和我们一起看见技术的下一种可能。', '本次讲座围绕人工智能的最新发展，探讨生成式 AI 如何改变学习、科研与日常生活。\n\n我们将从直观的案例出发，理解大模型的基本原理，体验智能应用的构建过程，并一起讨论技术发展带来的机遇与责任。无论你来自哪个专业，都可以在这里找到属于自己的新视角。\n\n活动安排\n14:00—14:15 入场与签到\n14:15—15:30 主题分享与案例演示\n15:30—16:00 自由交流与问答'],
    ['e-music', '把青春唱给秋天听', '文体活动', '校学生会 · 文艺部', '露天音乐广场', 5, 200, 'music', '落日、晚风与现场音乐，一场属于我们的草坪音乐会。', '让忙碌的课表暂停一晚，和朋友一起走进校园音乐现场。校园乐队、原创歌手与音乐社团将轮番登场。\n\n你可以坐在草坪上听歌，也可以跟着节奏一起合唱。欢迎携带野餐垫，请保持场地整洁。活动遇雨将另行通知。'],
    ['e-volunteer', '让书香抵达更远的地方', '志愿服务', '青年志愿者协会', '图书馆 · 南门集合', 9, 30, 'volunteer', '整理一本书，传递一份温暖。加入乡村阅读陪伴计划。', '我们将共同整理捐赠书籍，为周边社区的孩子们准备阅读书单，并开展一场有趣的阅读陪伴活动。\n\n活动包含岗前培训、图书整理与阅读互动。请穿着便于行动的服装，准时到达集合地点。本活动结束后可获得志愿服务时长记录。'],
    ['e-innovation', '从一个想法，到无限可能', '创新创业', '创新创业中心', '大学生创业基地 · A203', 12, 60, 'innovation', '校园创意工作坊，让灵感走出笔记本，成为真正的作品。', '带着你的灵感来，我们一起用设计思维重新发现身边的问题。活动将通过小组共创、快速原型与路演分享，帮助你把想法变成可以展示的方案。\n\n无需创业经验，欢迎跨专业组队。现场提供基础材料，请自带笔记本电脑。'],
    ['e-photo', '在校园，收藏一束光', '社团活动', '光影摄影协会', '桂子山 · 图书馆前广场', 3, 40, 'photo', '一场轻松的校园摄影漫游，用镜头重新认识熟悉的风景。', '跟随摄影协会的同学，探索校园里容易被错过的光影与角落。我们会分享构图、用光和手机摄影技巧，并在漫游结束后交流作品。\n\n手机或相机均可参加，不要求摄影基础。建议穿着舒适的鞋子。'],
    ['e-sport', '一起奔跑，把热爱接力', '文体活动', '体育学院 · 跑步协会', '佑铭体育场', 10, 80, 'sport', '用一场校园接力赛，遇见同频的伙伴与更好的自己。', '以团队为单位参加趣味接力与校园定向挑战，体验运动与协作的乐趣。\n\n活动含热身指导、团队接力及赛后拉伸，请穿着运动服与运动鞋，自备饮用水。如有不适合运动的身体状况，请勿报名。'],
    ['e-reading', '在文字里，与更大的世界相遇', '社团活动', '桂子读书会', '图书馆 · 共享研讨室', -4, 25, 'reading', '从一本书出发，交换看世界的不同方式。', '本期读书会围绕成长、选择与自我展开。带上最近正在读的一本书，分享一个打动你的片段。每个观点都值得被认真听见。'],
    ['e-design', '设计思维与校园生活', '创新创业', '创新创业中心', '创业基地 · 多功能教室', 15, 50, 'innovation', '从观察身边的小问题开始，探索设计的力量。', '新一期设计思维工作坊即将开放，欢迎持续关注。'],
    ['e-lecture', '星空之下，探索宇宙的边界', '学术讲座', '物理科学与技术学院', '理科楼 · 301', 2, 2, 'space', '从校园出发，向宇宙提问。', '一起回顾人类探索宇宙的故事，了解天文观测的基本方法，讨论深空探索中的前沿问题。'],
    ['e-green', '给校园添一抹绿', '志愿服务', '绿色环保协会', '东区花园', 4, 25, 'volunteer', '认识校园植物，参与绿色校园共建。', '校园花园养护与植物科普活动，包括垃圾分类学习、花园维护和环保知识分享。'],
  ];
  const events = definitions.map(([id, title, category, organizer, location, days, capacity, cover, subtitle, description], i) => ({
    id, title, category, organizer, location, startTime: at(days), endTime: at(days, 16), registrationDeadline: at(days - 1, 20), capacity,
    cover, subtitle, description, notes: '请提前 15 分钟到场，携带校园卡；报名后如无法参加，请及时取消，将机会留给其他同学。',
    status: i === 7 ? 'draft' : i === 9 ? 'closed' : 'open', deleted: false, createdAt: at(-14 + i),
  }));
  const registrations = [
    ['u-student2', 'e-ai', 'pending', -1], ['u-student3', 'e-ai', 'approved', -2], ['u-student4', 'e-ai', 'pending', 0],
    ['u-student2', 'e-music', 'approved', -3], ['u-student3', 'e-music', 'pending', -1], ['u-student4', 'e-volunteer', 'approved', -2],
    ['u-student2', 'e-innovation', 'pending', 0], ['u-student3', 'e-photo', 'approved', -3],
    ['u-student2', 'e-lecture', 'approved', -2], ['u-student3', 'e-lecture', 'pending', -1],
    ['u-student', 'e-reading', 'approved', -7], ['u-student4', 'e-sport', 'rejected', -1],
  ].map(([userId, eventId, status, days], i) => ({ id: `r-${i}`, userId, eventId, status, applyTime: at(days, 10), reviewedAt: status === 'approved' || status === 'rejected' ? at(days, 12) : null, reviewerId: status === 'approved' || status === 'rejected' ? 'u-admin' : null, remark: status === 'rejected' ? '报名信息待补充，可完善资料后重新申请。' : '' }));
  return { users, events, registrations };
}
