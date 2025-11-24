/**
 * Crypto Wealth Quiz - Main Script
 * Handles quiz logic, scoring, and lead capture.
 */

// --- Tracking & Analytics ---

function trackEvent(eventName, data = {}) {
    console.log(`[TRACKING] ${eventName}:`, data);
    // Example: gtag('event', eventName, data);
    // Example: fbq('track', eventName, data);
}

// --- Lead Capture ---

async function submitLead(email, result) {
    console.log(`[LEAD CAPTURE] Email: ${email}, Result: ${result}`);

    // Store in localStorage for demonstration purposes
    const leads = JSON.parse(localStorage.getItem('crypto_quiz_leads') || '[]');
    leads.push({
        email,
        result,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('crypto_quiz_leads', JSON.stringify(leads));

    // Example Integration:
    // const webhookUrl = 'YOUR_WEBHOOK_URL_HERE';
    // await fetch(webhookUrl, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, result, timestamp: new Date().toISOString() })
    // });

    return true; // Simulate success
}

// --- Quiz Data ---

const quizData = [
    {
        question: "How confident do you feel making financial decisions on your own?",
        options: [
            { text: "I need a lot of guidance", weights: { Beginner: 3, Passive: 1 } },
            { text: "I'm okay but want validation", weights: { Builder: 2, Beginner: 1 } },
            { text: "I trust my gut completely", weights: { Trader: 3, Builder: 1 } },
            { text: "I prefer automated systems", weights: { Passive: 3, Builder: 1 } }
        ]
    },
    {
        question: "What’s your biggest fear when it comes to crypto investing?",
        options: [
            { text: "Getting scammed or hacked", weights: { Beginner: 3 } },
            { text: "Buying at the top (losing value)", weights: { Builder: 2, Trader: 1 } },
            { text: "Missing out on the next big pump", weights: { Trader: 3 } },
            { text: "Spending too much time staring at charts", weights: { Passive: 3, Builder: 1 } }
        ]
    },
    {
        question: "How soon do you want to see results?",
        options: [
            { text: "Immediately (Day Trading)", weights: { Trader: 3 } },
            { text: "In a few weeks/months", weights: { Builder: 2, Passive: 1 } },
            { text: "Years (Long-term compounding)", weights: { Builder: 3, Passive: 2 } },
            { text: "I'm just exploring", weights: { Beginner: 3 } }
        ]
    },
    {
        question: "Do you prefer automated income or active control?",
        options: [
            { text: "100% Automated (Set & Forget)", weights: { Passive: 3 } },
            { text: "Mostly automated with some checks", weights: { Builder: 2, Passive: 1 } },
            { text: "Active control (I want to pull the trigger)", weights: { Trader: 3 } },
            { text: "I don't know yet", weights: { Beginner: 3 } }
        ]
    },
    {
        question: "How much time per week can you realistically commit?",
        options: [
            { text: "Less than 1 hour", weights: { Passive: 3, Builder: 1 } },
            { text: "1-5 hours", weights: { Builder: 2, Beginner: 1 } },
            { text: "10+ hours (It's a hobby/job)", weights: { Trader: 3 } },
            { text: "Whatever it takes", weights: { Trader: 2, Builder: 2 } }
        ]
    },
    {
        question: "Which statement feels most like you right now?",
        options: [
            { text: "I have money sitting idle and want it to grow", weights: { Passive: 2, Builder: 2 } },
            { text: "I want to quit my job through trading", weights: { Trader: 3 } },
            { text: "I want to protect my savings from inflation", weights: { Builder: 3 } },
            { text: "I'm curious but cautious", weights: { Beginner: 3 } }
        ]
    },
    {
        question: "How much have you already lost or made in crypto?",
        options: [
            { text: "I haven't invested yet", weights: { Beginner: 3 } },
            { text: "I lost money chasing pumps", weights: { Trader: 1, Builder: 2 } },
            { text: "I've made some gains but want more", weights: { Builder: 2, Passive: 1 } },
            { text: "I'm doing well, just scaling up", weights: { Trader: 2, Builder: 2 } }
        ]
    },
    {
        question: "What frustrates you MOST about crypto content online?",
        options: [
            { text: "It's too technical/confusing", weights: { Beginner: 3 } },
            { text: "Too much hype/scams", weights: { Builder: 2, Passive: 1 } },
            { text: "Not enough actionable trade setups", weights: { Trader: 3 } },
            { text: "Requires too much screen time", weights: { Passive: 3 } }
        ]
    },
    {
        question: "What is your primary financial goal?",
        options: [
            { text: "Replace my salary", weights: { Trader: 2, Passive: 2 } },
            { text: "Build a retirement nest egg", weights: { Builder: 3 } },
            { text: "Make 'fun money' on the side", weights: { Trader: 1, Beginner: 2 } },
            { text: "Learn a new skill", weights: { Beginner: 2, Builder: 1 } }
        ]
    },
    {
        question: "How do you handle market dips (red days)?",
        options: [
            { text: "Panic sell everything", weights: { Beginner: 3 } },
            { text: "Buy the dip!", weights: { Builder: 3, Trader: 1 } },
            { text: "Short the market (profit from the drop)", weights: { Trader: 3 } },
            { text: "Ignore it, I'm in for the long haul", weights: { Passive: 3, Builder: 1 } }
        ]
    },
    {
        question: "Do you want a free personalized PDF based on your quiz results?",
        options: [
            { text: "Yes, please!", weights: { Beginner: 1, Builder: 1, Trader: 1, Passive: 1 } },
            { text: "Absolutely", weights: { Beginner: 1, Builder: 1, Trader: 1, Passive: 1 } }
        ]
    }
];

// --- Quiz Logic ---

const quizApp = document.getElementById('quiz-app');
const startBtn = document.getElementById('start-quiz-btn');

let currentQuestionIndex = 0;
let scores = {
    Beginner: 0,
    Builder: 0,
    Trader: 0,
    Passive: 0
};

if (startBtn) {
    startBtn.addEventListener('click', startQuiz);
}

function startQuiz() {
    currentQuestionIndex = 0;
    scores = { Beginner: 0, Builder: 0, Trader: 0, Passive: 0 };
    trackEvent('quiz_start');
    renderQuestion();
}

function renderQuestion() {
    const question = quizData[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / (quizData.length + 1)) * 100;

    let html = `
        <div class="question-container fade-in">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <h3 class="question-text">Q${currentQuestionIndex + 1}. ${question.question}</h3>
            <div class="options-grid">
                ${question.options.map((option, index) => `
                    <div class="quiz-option" onclick="selectOption(${index})">
                        ${option.text}
                    </div>
                `).join('')}
            </div>
            <div class="nav-buttons">
                ${currentQuestionIndex > 0 ? `<button class="btn-nav" onclick="prevQuestion()">← Back</button>` : '<div></div>'}
            </div>
        </div>
    `;

    quizApp.innerHTML = html;
}

function selectOption(optionIndex) {
    const question = quizData[currentQuestionIndex];
    const selectedOption = question.options[optionIndex];

    // Update scores
    for (const [persona, weight] of Object.entries(selectedOption.weights)) {
        scores[persona] += weight;
    }

    // Visual feedback
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((opt, idx) => {
        if (idx === optionIndex) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });

    setTimeout(() => {
        nextQuestion();
    }, 300);
}

function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        showEmailForm();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

function showEmailForm() {
    const progress = 95;
    quizApp.innerHTML = `
        <div class="question-container fade-in">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <h3 class="question-text">Last Step: Where should we send your personalized results?</h3>
            <div class="email-form-container">
                <input type="email" id="user-email" class="email-input" placeholder="Enter your best email address" required>
                <button class="btn btn-primary btn-large" style="width: 100%" onclick="submitQuiz()">Get My Results & PDF</button>
                <p style="margin-top: 1rem; font-size: 0.8rem; color: #94a3b8;">We respect your privacy. Unsubscribe at any time.</p>
            </div>
        </div>
    `;
}

async function submitQuiz() {
    const emailInput = document.getElementById('user-email');
    if (!emailInput.value || !emailInput.value.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }

    // Calculate Result
    const result = calculateResult();

    // Track Lead
    trackEvent('lead_submit', { email: emailInput.value, result: result });
    await submitLead(emailInput.value, result);

    // Simulate processing then show result
    quizApp.innerHTML = `
        <div class="question-container">
            <h3>Analyzing your profile...</h3>
            <div class="pulse" style="width: 50px; height: 50px; border-radius: 50%; background: var(--accent-blue); margin: 2rem auto;"></div>
        </div>
    `;

    setTimeout(() => {
        showResultView(result);
    }, 1500);
}

function calculateResult() {
    // Find persona with highest score
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}

function showResultView(type) {
    const pdfs = {
        "Beginner": {
            title: "Crypto Starter Blueprint",
            class: "beginner-bg",
            desc: "Your safe, step-by-step guide to making your first investment without getting scammed."
        },
        "Builder": {
            title: "Smart Wealth Builder Roadmap",
            class: "builder-bg",
            desc: "The proven system for long-term compounding and portfolio management."
        },
        "Trader": {
            title: "Active Trader’s Playbook",
            class: "trader-bg",
            desc: "High-probability setups and risk management protocols for active income."
        },
        "Passive": {
            title: "Passive Crypto Income Guide",
            class: "passive-bg",
            desc: "How to make your crypto work for you while you sleep."
        }
    };

    const pdf = pdfs[type] || pdfs["Builder"];

    // Inject Bridge Section Content
    const bridgeContainer = document.getElementById('bridge-section-container');
    if (bridgeContainer) {
        bridgeContainer.innerHTML = `
            <section class="bridge-section">
                <div class="container bridge-content">
                    <h3>Why the ${type} Strategy Fits You</h3>
                    <p>Based on your answers, you value <strong>${type === 'Trader' ? 'control and speed' : type === 'Passive' ? 'freedom and automation' : 'security and growth'}</strong>. 
                    Most people fail because they try to be everything at once. Your advantage is focus.</p>
                    <p style="margin-top: 1rem;">The <strong>WealthBlueprintLab</strong> is designed to help ${type}s like you avoid common pitfalls and fast-track your results.</p>
                </div>
            </section>
        `;
    }

    quizApp.innerHTML = `
        <div class="result-view fade-in">
            <h2>Your Investor Type: <span class="highlight">${type}</span></h2>
            <p>Based on your answers, we've selected this personalized roadmap for you:</p>
            
            <div class="result-pdf-placeholder ${pdf.class}">
                <div class="pdf-icon">📄</div>
                <h3>${pdf.title}</h3>
                <p>${pdf.desc}</p>
            </div>

            <p class="email-notice">We've sent a copy to your email!</p>

            <div class="cta-box-result">
                <h3>Next Step: Unlock The Full Program</h3>
                <p>Get the complete training to master your ${type} strategy.</p>
                <a href="https://www.digistore24.com/redir/363385/WealthBlueprintLab/" class="btn btn-primary btn-large pulse" onclick="trackEvent('affiliate_click')">Unlock Full Program</a>
            </div>
        </div>
    `;
}

// --- FAQ Accordion Logic ---

document.addEventListener('DOMContentLoaded', () => {
    const faqHeaders = document.querySelectorAll('.faq-header');

    faqHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;
            const currentIcon = header.querySelector('.toggle-icon');

            // Close other items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== currentItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                    const icon = item.querySelector('.toggle-icon');
                    if (icon) icon.innerHTML = '+';
                }
            });

            // Toggle current item
            currentItem.classList.toggle('active');

            // Update icon
            if (currentItem.classList.contains('active')) {
                currentIcon.innerHTML = '&minus;';
            } else {
                currentIcon.innerHTML = '+';
            }
        });
    });
});
