// ============================================================
// tools/branch-generator/chinese-map.ts — 中文关键词到英文映射表
// ============================================================

/**
 * 中文关键词智能映射表
 * 覆盖 6 大分类，70+ 高频词条
 * 分类：用户与权限、业务实体、技术操作、系统运维、界面交互、异常处理
 */
export const chineseMap: Record<string, string> = {
  // ---- 用户与权限 ----
  用户: "user",
  登录: "login",
  注册: "register",
  权限: "permission",
  角色: "role",
  认证: "auth",
  授权: "authorize",
  密码: "password",
  账号: "account",
  头像: "avatar",
  个人: "profile",
  退出: "logout",
  邀请: "invite",
  验证码: "captcha",
  令牌: "token",

  // ---- 业务实体 ----
  订单: "order",
  支付: "payment",
  商品: "product",
  搜索: "search",
  购物车: "cart",
  库存: "inventory",
  价格: "price",
  优惠券: "coupon",
  折扣: "discount",
  发票: "invoice",
  物流: "logistics",
  退款: "refund",
  评论: "review",
  收藏: "favorite",
  消息: "message",
  通知: "notification",

  // ---- 技术操作 ----
  修复: "fix",
  优化: "optimize",
  重构: "refactor",
  部署: "deploy",
  缓存: "cache",
  更新: "update",
  删除: "delete",
  添加: "add",
  修改: "modify",
  迁移: "migrate",
  合并: "merge",
  拆分: "split",
  同步: "sync",
  导入: "import",
  导出: "export",
  解析: "parse",
  序列化: "serialize",
  压缩: "compress",

  // ---- 系统运维 ----
  监控: "monitor",
  日志: "log",
  配置: "config",
  集群: "cluster",
  备份: "backup",
  恢复: "restore",
  容器: "container",
  服务: "service",
  负载: "loadbalance",
  健康检查: "healthcheck",
  告警: "alert",
  调度: "schedule",
  队列: "queue",
  数据库: "database",
  查询: "query",

  // ---- 界面交互 ----
  页面: "page",
  弹窗: "modal",
  表单: "form",
  导航: "nav",
  侧栏: "sidebar",
  菜单: "menu",
  按钮: "button",
  列表: "list",
  表格: "table",
  图表: "chart",
  标签: "tab",
  轮播: "carousel",
  骨架屏: "skeleton",
  提示: "tooltip",
  面包屑: "breadcrumb",
  抽屉: "drawer",

  // ---- 异常处理 ----
  超时: "timeout",
  崩溃: "crash",
  异常: "exception",
  漏洞: "vulnerability",
  泄漏: "leak",
  死锁: "deadlock",
  溢出: "overflow",
  中断: "interrupt",
  重试: "retry",
  降级: "degrade",
  熔断: "circuitbreaker",
  错误: "error",
  失败: "fail",
  兜底: "fallback",
};

/**
 * 将中文描述中的关键词替换为英文
 * 优先匹配最长的中文词组，避免部分匹配问题
 */
export function translateChineseToEnglish(input: string): string {
  // 按中文词条长度降序排列，优先匹配长词组
  const sortedKeys = Object.keys(chineseMap).sort(
    (a, b) => b.length - a.length,
  );

  let result = input;
  for (const chinese of sortedKeys) {
    const english = chineseMap[chinese];
    if (result.includes(chinese)) {
      result = result.replaceAll(chinese, ` ${english} `);
    }
  }
  return result;
}
