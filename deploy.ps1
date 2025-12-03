# 智加本智能AI管理后台 - GitHub 部署脚本
# 使用方法：在 PowerShell 中运行 .\deploy.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  智加本智能AI管理后台 - GitHub 部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Git 是否安装
try {
    $gitVersion = git --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Git 已安装: $gitVersion" -ForegroundColor Green
    } else {
        throw "Git not found"
    }
} catch {
    Write-Host "✗ 错误: 未检测到 Git" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 Git：" -ForegroundColor Yellow
    Write-Host "  下载地址: https://git-scm.com/downloads" -ForegroundColor Yellow
    Write-Host "  安装后请重新运行此脚本" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit 1
}

Write-Host ""

# 检查是否在正确的目录
$currentDir = Get-Location
Write-Host "当前目录: $currentDir" -ForegroundColor Yellow
Write-Host ""

# 检查 Git 仓库状态
Write-Host "检查 Git 仓库状态..." -ForegroundColor Yellow
$gitStatus = git status 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "未检测到 Git 仓库，正在初始化..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git 仓库已初始化" -ForegroundColor Green
}

Write-Host ""

# 检查是否有未提交的更改
$statusOutput = git status --porcelain
if ($statusOutput) {
    Write-Host "检测到未提交的文件，正在添加..." -ForegroundColor Yellow
    git add .
    
    $commitMessage = Read-Host "请输入提交信息（直接回车使用默认信息）"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "更新项目文件"
    }
    
    git commit -m $commitMessage
    Write-Host "✓ 文件已提交" -ForegroundColor Green
} else {
    Write-Host "✓ 所有文件已提交" -ForegroundColor Green
}

Write-Host ""

# 检查远程仓库
$remoteUrl = git remote get-url origin 2>$null

if ($remoteUrl) {
    Write-Host "检测到远程仓库: $remoteUrl" -ForegroundColor Green
    Write-Host ""
    $updateRemote = Read-Host "是否要更新远程仓库地址？(y/n)"
    if ($updateRemote -eq "y" -or $updateRemote -eq "Y") {
        $newUrl = Read-Host "请输入新的远程仓库地址"
        if ($newUrl) {
            git remote set-url origin $newUrl
            Write-Host "✓ 远程仓库地址已更新" -ForegroundColor Green
        }
    }
} else {
    Write-Host "未检测到远程仓库" -ForegroundColor Yellow
    Write-Host ""
    $addRemote = Read-Host "是否要添加远程仓库？(y/n)"
    if ($addRemote -eq "y" -or $addRemote -eq "Y") {
        $githubUsername = Read-Host "请输入 GitHub 用户名"
        $repoName = Read-Host "请输入仓库名称"
        
        if ($githubUsername -and $repoName) {
            $remoteUrl = "https://github.com/$githubUsername/$repoName.git"
            git remote add origin $remoteUrl
            Write-Host "✓ 远程仓库已添加: $remoteUrl" -ForegroundColor Green
        } else {
            Write-Host "✗ 用户名和仓库名不能为空" -ForegroundColor Red
        }
    }
}

Write-Host ""

# 检查当前分支
$currentBranch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    git branch -M main
    $currentBranch = "main"
}

Write-Host "当前分支: $currentBranch" -ForegroundColor Yellow
Write-Host ""

# 推送选项
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  准备推送到 GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($remoteUrl) {
    Write-Host "远程仓库: $remoteUrl" -ForegroundColor Yellow
    Write-Host "分支: $currentBranch" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "注意: 推送时可能需要输入 GitHub 用户名和密码" -ForegroundColor Yellow
    Write-Host "     如果启用了双因素认证，需要使用 Personal Access Token" -ForegroundColor Yellow
    Write-Host ""
    
    $confirm = Read-Host "是否现在推送到 GitHub？(y/n)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Host ""
        Write-Host "正在推送到 GitHub..." -ForegroundColor Yellow
        
        try {
            git push -u origin $currentBranch
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✓ 推送成功！" -ForegroundColor Green
                Write-Host ""
                Write-Host "========================================" -ForegroundColor Cyan
                Write-Host "  下一步操作" -ForegroundColor Cyan
                Write-Host "========================================" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "1. 访问您的仓库: $remoteUrl" -ForegroundColor Yellow
                Write-Host "2. 点击 'Settings'（设置）" -ForegroundColor Yellow
                Write-Host "3. 在左侧菜单找到 'Pages'" -ForegroundColor Yellow
                Write-Host "4. 在 'Source' 下选择分支: $currentBranch" -ForegroundColor Yellow
                Write-Host "5. 选择文件夹: / (root)" -ForegroundColor Yellow
                Write-Host "6. 点击 'Save'" -ForegroundColor Yellow
                Write-Host ""
                
                if ($remoteUrl -match "github\.com/([^/]+)/([^/]+)") {
                    $username = $matches[1]
                    $repo = $matches[2] -replace '\.git$', ''
                    Write-Host "等待几分钟后，您的网站将在以下地址可用:" -ForegroundColor Green
                    Write-Host "https://$username.github.io/$repo/" -ForegroundColor Cyan
                }
                Write-Host ""
            } else {
                throw "Push failed"
            }
        } catch {
            Write-Host ""
            Write-Host "✗ 推送失败" -ForegroundColor Red
            Write-Host ""
            Write-Host "可能的原因：" -ForegroundColor Yellow
            Write-Host "  1. GitHub 仓库尚未创建" -ForegroundColor Yellow
            Write-Host "  2. 用户名或密码（Token）错误" -ForegroundColor Yellow
            Write-Host "  3. 网络连接问题" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "您可以手动执行以下命令:" -ForegroundColor Yellow
            Write-Host "  git push -u origin $currentBranch" -ForegroundColor White
        }
    } else {
        Write-Host ""
        Write-Host "已取消推送。您可以稍后手动执行:" -ForegroundColor Yellow
        Write-Host "  git push -u origin $currentBranch" -ForegroundColor White
    }
} else {
    Write-Host "未配置远程仓库，无法推送" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请先：" -ForegroundColor Yellow
    Write-Host "  1. 在 GitHub 上创建仓库" -ForegroundColor Yellow
    Write-Host "  2. 运行: git remote add origin https://github.com/用户名/仓库名.git" -ForegroundColor Yellow
    Write-Host "  3. 重新运行此脚本" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "脚本执行完成！" -ForegroundColor Green
Read-Host "按 Enter 键退出"

