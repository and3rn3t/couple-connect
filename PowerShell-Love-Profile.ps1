# 💕 Couple Connect - PowerShell Love Profile
# Add this to your PowerShell profile for maximum fun!

# 🎨 Pretty colors for the terminal
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "Magenta"

# 🎉 Fun welcome message
function Show-LoveWelcome {
    Write-Host "💕 Welcome to Couple Connect Development! 💕" -ForegroundColor Magenta
    Write-Host "🎉 Ready to spread some love through code? 🎉" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Fun commands available:" -ForegroundColor Cyan
    Write-Host "  💕 love-dev     - Start development with extra love" -ForegroundColor Green
    Write-Host "  🚀 love-deploy  - Deploy love to the world" -ForegroundColor Green
    Write-Host "  🎉 love-build   - Build with celebration" -ForegroundColor Green
    Write-Host "  🔍 love-test    - Test with tender care" -ForegroundColor Green
    Write-Host "  💝 love-format  - Format code with love" -ForegroundColor Green
    Write-Host "  🎊 love-status  - Check relationship status" -ForegroundColor Green
    Write-Host ""
}

# 🚀 Fun development commands
function love-dev {
    Write-Host "💕 Starting development server with extra love! 💕" -ForegroundColor Magenta
    npm run dev
}

function love-deploy {
    Write-Host "🚀 Launching love rocket to production! 🚀" -ForegroundColor Yellow
    Write-Host "3... 2... 1... LOVE BLAST OFF! 💖" -ForegroundColor Red
    npm run deploy
}

function love-build {
    Write-Host "🎉 Building the most beautiful love app ever! 🎉" -ForegroundColor Green
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✨ Build successful! Love is in the air! ✨" -ForegroundColor Magenta
    }
}

function love-test {
    Write-Host "🔍 Testing with the gentleness of a relationship counselor... 🔍" -ForegroundColor Cyan
    npm run test
    if ($LASTEXITCODE -eq 0) {
        Write-Host "💚 All tests passing! Your code is relationship-ready! 💚" -ForegroundColor Green
    }
}

function love-format {
    Write-Host "💝 Gift-wrapping your code with prettier! 💝" -ForegroundColor Yellow
    npm run format
    Write-Host "✨ Your code is now as beautiful as love itself! ✨" -ForegroundColor Magenta
}

function love-status {
    Write-Host "💕 Relationship Status Check 💕" -ForegroundColor Magenta
    Write-Host "----------------------------------------" -ForegroundColor White

    # Git status with love
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus) {
        Write-Host "💔 You have uncommitted changes! Your code needs some commitment!" -ForegroundColor Red
        Write-Host "🤗 Files waiting for love:" -ForegroundColor Yellow
        git status --short
    } else {
        Write-Host "💚 Repository is clean! Everything is committed to love! 💚" -ForegroundColor Green
    }

    # Check if on main branch
    $currentBranch = git branch --show-current 2>$null
    if ($currentBranch -eq "main") {
        Write-Host "👑 You're on the main branch! The royal love branch! 👑" -ForegroundColor Yellow
    } else {
        Write-Host "🌿 You're on branch: $currentBranch 🌿" -ForegroundColor Cyan
    }

    Write-Host "----------------------------------------" -ForegroundColor White
}

# 🎪 Fun git aliases
function love-commit {
    param([string]$message)
    if (-not $message) {
        Write-Host "💌 Please provide a love message for your commit!" -ForegroundColor Red
        Write-Host "Usage: love-commit 'your romantic commit message'" -ForegroundColor Yellow
        return
    }
    git add .
    git commit -m "💕 $message"
    Write-Host "💖 Love has been committed to the repository! 💖" -ForegroundColor Magenta
}

function love-push {
    Write-Host "📤 Sending love to the remote repository... 📤" -ForegroundColor Cyan
    git push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 Love successfully delivered! 🎉" -ForegroundColor Green
    }
}

# 🌟 Random love facts about your code
function love-fact {
    $facts = @(
        "💡 Did you know? Every component you write brings couples 0.3% closer together!",
        "🎯 Fun fact: This codebase contains 47% more love than the average app!",
        "🚀 Your commit history is basically a love story between you and clean code!",
        "🎨 Studies show that pink-themed IDEs increase relationship satisfaction by 23%!",
        "💝 Every bug you fix prevents at least 2.7 relationship arguments!",
        "🌟 Your TypeScript skills are so good, they deserve their own dating profile!",
        "🎪 This app has been blessed by the coding cupids for maximum relationship magic!"
    )
    $randomFact = Get-Random -InputObject $facts
    Write-Host $randomFact -ForegroundColor Magenta
}

# 🎉 Show welcome message when profile loads
Show-LoveWelcome

# 🎯 Auto-complete for love commands
Register-ArgumentCompleter -CommandName love-commit -ParameterName message -ScriptBlock {
    param($commandName, $parameterName, $wordToComplete, $commandAst, $fakeBoundParameters)

    $suggestions = @(
        "💕 feat: add heart-melting feature",
        "🐛 fix: squashed a relationship bug",
        "🎨 style: made UI more beautiful than a sunset",
        "⚡ perf: optimized for love at light speed",
        "📚 docs: updated the love manual",
        "🧪 test: added validation for happy relationships"
    )

    $suggestions | Where-Object { $_ -like "*$wordToComplete*" } | ForEach-Object {
        New-Object System.Management.Automation.CompletionResult $_, $_, 'ParameterValue', $_
    }
}

Write-Host "💫 PowerShell Love Profile loaded! Type 'love-fact' for inspiration! 💫" -ForegroundColor Yellow
