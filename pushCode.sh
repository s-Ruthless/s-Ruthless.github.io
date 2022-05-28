#!/bin/bash
echo -e "\n========================= \033[1;47;30m Begin \033[0m =========================\n"

echo -e "\033[1;33m1 拉取远端文件\033[0m"
echo -e "拉取中...\n"
git pull
echo -e "\n拉取成功！\n\n"
echo -e "\033[1;33m2 查看文件状态\033[0m"
git status
echo -e
# Git 的四种文件状态    https://zhuanlan.zhihu.com/p/456600711
echo -e "============================================"
echo -e "  \033[31mUntracked  :  \033[0m新添加文件，未加入本地仓库"
echo -e "  \033[31mModified   :  \033[0m已修改文件，未进行其他操作"
echo -e "  \033[32mStaged     :  \033[0m已暂存文件，才加入本地仓库"
echo -e "  \033[32mUnmodified :  \033[0m未修改文件，已加入本地仓库"
echo -e "============================================"

echo -e "\n\n\033[1;33m3 提交本地文件\033[0m"
# echo "═══════════════════════════════════════════════════"
echo -e " ● 输入提交信息。输入 1，为推送代码。"
echo -e " ● 多条信息。请用「空格」隔开。"
echo -e "\n\033[33m提交信息: \033[0m\c"
echo -e
read -r inputMsg
defaultMmsg="推送代码"
if [ "$inputMsg" == "1" ]; then
  commitMsg="$defaultMmsg"
else
  commitMsg="$inputMsg"
fi
git add .
git commit -m "$commitMsg"
git push origin main

echo -e "\n\n\033[1;33m4 本次更新内容\033[0m"
# echo "═══════════════════════════════════════════════════"
for msg in $commitMsg; do
  echo -e " \033[1;32m●\033[0m $msg"
done

echo -e "\n========================== \033[1;47;30m End \033[0m =========================="
# 脚本运行完成后，不关闭界面。
exec /bin/bash
