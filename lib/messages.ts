import type { Locale } from "@/lib/locales";

export const messages = {
  zh: {
    metadata: {
      description: "内部 Markdown API 文档浏览器"
    },
    common: {
      markApiAdmin: "Markdown API 文档管理",
      backToProjects: "返回项目列表",
      loading: "加载中",
      view: "查看",
      manage: "管理",
      delete: "删除",
      cancel: "取消",
      current: "当前"
    },
    admin: {
      logout: "退出登录",
      login: {
        password: "管理密码",
        submit: "登录"
      },
      projects: {
        newProject: "新建项目",
        title: "项目列表",
        description: "上传完整 Markdown 文档后，分享链接会展示最新版本。",
        latestVersion: "最新版本：",
        noVersion: "暂无版本",
        empty: "还没有项目。"
      },
      newProject: {
        title: "新建项目",
        name: "项目名称",
        namePlaceholder: "例如：支付服务 API 文档",
        submit: "创建项目"
      },
      project: {
        publicAccess: "公开访问",
        shareLink: "分享链接",
        shareLinkLabel: "分享链接",
        shareHelp: "拥有该链接的用户可访问当前文档。",
        allowPublicVersionHistory: "允许访客查看历史版本",
        allowPublicVersionHistoryHelp: "开启后，公开文档页显示版本切换器，旧版本链接可访问。关闭后，公开文档页只显示最新版本。",
        uploadTitle: "上传新版本",
        note: "版本备注",
        notePlaceholder: "本次更新的后台备注，可留空",
        uploadSubmit: "上传新版本",
        history: "历史版本",
        versionTime: "版本时间",
        noteHeader: "备注",
        action: "操作",
        noNote: "无备注",
        emptyVersions: "还没有上传文档版本。",
        slug: "slug："
      },
      errors: {
        invalidPassword: "管理密码不正确",
        emptyProjectName: "项目名称不能为空",
        missingMarkdownFile: "请选择 Markdown 文件",
        invalidMarkdownFile: "只允许上传 .md 文件",
        markdownTooLarge: "Markdown 文件不能超过 2MB"
      }
    },
    docs: {
      toc: "目录",
      tocEmpty: "当前文档没有二级或三级标题。",
      tocExpand: "展开全部二级目录",
      tocCompact: "只显示一级目录",
      tocResize: "调整目录宽度",
      version: "版本",
      selectVersion: "选择版本",
      switchVersion: "切换版本",
      emptyProject: "这个项目还没有上传文档版本。",
      search: {
        label: "搜索当前文档",
        placeholder: "搜索当前文档",
        shortcutTitle: "按 ↑/↓ 切换匹配项",
        inlineHint: "↑↓ 切换",
        clear: "清除搜索",
        noMatches: "无匹配"
      },
      projectSwitcher: {
        opening: "打开中",
        switchProject: "切换项目",
        deleteRecord: "删除访问记录",
        deleteRecordQuestion: "删除这条访问记录？"
      }
    },
    components: {
      copy: {
        copyLink: "复制链接",
        copied: "已复制",
        failed: "复制失败",
        clickToCopy: "点击复制",
        copyField: "复制字段名",
        copyEndpoint: "复制接口 URL",
        copyText: "复制文本"
      },
      file: {
        label: "Markdown 文件",
        choose: "选择 Markdown 文件",
        selectedHint: "已选择，提交后会生成新版本",
        emptyHint: "支持 .md 文件，最大 2MB",
        browse: "浏览文件"
      },
      theme: {
        label: "外观主题",
        system: "跟随系统",
        light: "浅色模式",
        dark: "深色模式"
      },
      locale: {
        label: "界面语言",
        zh: "中文",
        en: "English"
      },
      settings: {
        label: "偏好设置"
      }
    }
  },
  en: {
    metadata: {
      description: "Internal Markdown API documentation browser"
    },
    common: {
      markApiAdmin: "Markdown API documentation management",
      backToProjects: "Back to projects",
      loading: "Loading",
      view: "View",
      manage: "Manage",
      delete: "Delete",
      cancel: "Cancel",
      current: "Current"
    },
    admin: {
      logout: "Log out",
      login: {
        password: "Admin password",
        submit: "Log in"
      },
      projects: {
        newProject: "New project",
        title: "Projects",
        description: "After a full Markdown document is uploaded, the share link shows the latest version.",
        latestVersion: "Latest version: ",
        noVersion: "No versions",
        empty: "No projects yet."
      },
      newProject: {
        title: "New project",
        name: "Project name",
        namePlaceholder: "Example: Payment service API docs",
        submit: "Create project"
      },
      project: {
        publicAccess: "Public access",
        shareLink: "Share link",
        shareLinkLabel: "Share link",
        shareHelp: "Anyone with this link can access the current document.",
        allowPublicVersionHistory: "Allow visitors to view version history",
        allowPublicVersionHistoryHelp: "When enabled, public docs show the version picker and old version links work. When disabled, public docs only show the latest version.",
        uploadTitle: "Upload new version",
        note: "Version note",
        notePlaceholder: "Internal note for this update, optional",
        uploadSubmit: "Upload new version",
        history: "Version history",
        versionTime: "Version time",
        noteHeader: "Note",
        action: "Action",
        noNote: "No note",
        emptyVersions: "No document versions uploaded yet.",
        slug: "slug: "
      },
      errors: {
        invalidPassword: "Incorrect admin password",
        emptyProjectName: "Project name is required",
        missingMarkdownFile: "Choose a Markdown file",
        invalidMarkdownFile: "Only .md files are allowed",
        markdownTooLarge: "Markdown file must be 2MB or smaller"
      }
    },
    docs: {
      toc: "Contents",
      tocEmpty: "This document has no second- or third-level headings.",
      tocExpand: "Show all second-level headings",
      tocCompact: "Show first-level headings only",
      tocResize: "Resize contents sidebar",
      version: "Version",
      selectVersion: "Select version",
      switchVersion: "Switch version",
      emptyProject: "This project has no uploaded document versions yet.",
      search: {
        label: "Search current document",
        placeholder: "Search current document",
        shortcutTitle: "Use ↑/↓ to switch matches",
        inlineHint: "↑↓",
        clear: "Clear search",
        noMatches: "No matches"
      },
      projectSwitcher: {
        opening: "Opening",
        switchProject: "Switch project",
        deleteRecord: "Delete access record",
        deleteRecordQuestion: "Delete this access record?"
      }
    },
    components: {
      copy: {
        copyLink: "Copy link",
        copied: "Copied",
        failed: "Copy failed",
        clickToCopy: "Click to copy",
        copyField: "Copy field name",
        copyEndpoint: "Copy endpoint URL",
        copyText: "Copy text"
      },
      file: {
        label: "Markdown file",
        choose: "Choose Markdown file",
        selectedHint: "Selected. Submitting will create a new version.",
        emptyHint: ".md files up to 2MB",
        browse: "Browse"
      },
      theme: {
        label: "Theme",
        system: "System",
        light: "Light",
        dark: "Dark"
      },
      locale: {
        label: "Language",
        zh: "中文",
        en: "English"
      },
      settings: {
        label: "Preferences"
      }
    }
  }
} as const;

export type Messages = (typeof messages)[Locale];
export type AdminErrorCode = keyof typeof messages.zh.admin.errors;

export function getMessages(locale: Locale) {
  return messages[locale];
}

export function getAdminErrorMessage(locale: Locale, code: string | undefined) {
  if (!code || !(code in messages[locale].admin.errors)) {
    return undefined;
  }

  return messages[locale].admin.errors[code as AdminErrorCode];
}
