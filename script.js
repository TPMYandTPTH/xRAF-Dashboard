// Translations
const translations = {
    en: {
        pageLangLabel: "Choose Your Language:",
        dashboardTitle: "TP External RAF Dashboard",
        dashboardSubtitle: "Enter your details to view your referral status",
        phoneLabel: "Phone Number:",
        phonePlaceholder: "Enter your phone number (01XXXXXXXX)",
        phoneError: "Please provide a valid phone number (01XXXXXXXX).",
        emailLabel: "Email Address:",
        emailPlaceholder: "Enter your email address",
        emailError: "Please provide a valid email address.",
        viewStatusBtn: "View Referral Status",
        backToRAF: "Back to Referral Form",
        yourReferralsTitle: "Your Referrals",
        backBtn: "Back",
        totalReferrals: "Total Referrals",
        hiredReferrals: "Hired",
        inProgress: "In Progress",
        statusDistribution: "Status Distribution",
        earningsTitle: "Your Earnings",
        earningsStage: "Stage",
        earningsAmount: "Amount (RM)",
        earningsCount: "Count",
        earningsTotal: "Total",
        remindFriendsTitle: "Remind Your Friends",
        remindFriendsText: "Help your friends complete their assessments to join TP!",
        remindBtn: "Send WhatsApp Reminder",
        tpGlobal: "TP Global",
        followMalaysia: "TP Malaysia",
        followThailand: "TP Thailand",
        noReferrals: "No referrals found with these details.",
        referralName: "Friend's Name",
        referralEmail: "Email",
        referralStage: "Stage",
        referralStatus: "Status",
        referralDate: "Application Date",
        referralDays: "Days in Stage",
        referralAction: "Action",
        statusReceived: "Application Received",
        statusAssessment: "Assessment Stage",
        statusTalent: "Interview Stage",
        statusOperations: "Final Review",
        statusProbation: "Hired (Probation)",
        statusPassed: "Hired (Confirmed)",
        statusFailed: "Not Selected",
        statusPreviouslyApplied: "Previously Applied (No Payment)",
        statusHiredConfirmed: "Hired (Confirmed)",
        statusHiredProbation: "Hired (Probation)",
        statusPreviouslyAppliedNoPayment: "Previously Applied (No Payment)",
        statusFinalReview: "Final Review",
        statusInterviewStage: "Interview Stage",
        statusAssessmentStage: "Assessment Stage",
        statusApplicationReceived: "Application Received",
        statusNotSelected: "Not Selected",
        paymentNote: "Payment Information",
        paymentTermsTitle: "Payment Terms & Conditions",
        paymentTermsText1: "Payments will be made to your TnG eWallet linked to your phone number.",
        paymentTermsText2: "RM50 will be paid when candidate passes assessment. RM750 bonus will be paid only after your referred candidate successfully completes the 90-day probation period.",
        paymentTermsText3: "All payments are subject to verification and may take up to 30 days after probation completion.",
        closeBtn: "Close",
        questionsTitle: "Questions?",
        contactUsText: "Email us at:",
        statusAssessmentPassed: "Assessment Passed (RM50)",
        noRemindersNeeded: "All your friends are on track!",
        filteredViewLabel: "Simplified Status View",
        userNotFoundTitle: "No Referrals Found",
        userNotFoundText1: "We couldn't find any referrals with the provided email and phone number.",
        userNotFoundText2: "Please double-check your information or contact us for assistance.",
        okBtn: "OK",
        contactUsBtn: "Contact Us",
        errorTitle: "Error",
        errorMessage: "Failed to fetch referrals. Please try again later.",
        previouslyAppliedNote: "Note:",
        previouslyAppliedNoteText: "No payment will be made if the candidate had previously applied to TP"
    },
    ja: {
        pageLangLabel: "言語を選択:",
        dashboardTitle: "紹介ダッシュボード",
        dashboardSubtitle: "詳細を入力して紹介状況を表示",
        phoneLabel: "電話番号:",
        phonePlaceholder: "電話番号を入力 (01XXXXXXXX)",
        phoneError: "有効な電話番号を入力してください (01XXXXXXXX)",
        emailLabel: "メールアドレス:",
        emailPlaceholder: "メールアドレスを入力",
        emailError: "有効なメールアドレスを入力してください",
        viewStatusBtn: "紹介状況を表示",
        backToRAF: "紹介フォームに戻る",
        yourReferralsTitle: "あなたの紹介",
        backBtn: "戻る",
        totalReferrals: "総紹介数",
        hiredReferrals: "採用",
        inProgress: "進行中",
        statusDistribution: "ステータス分布",
        earningsTitle: "あなたの収益",
        earningsStage: "ステージ",
        earningsAmount: "金額 (RM)",
        earningsCount: "カウント",
        earningsTotal: "合計",
        remindFriendsTitle: "友達にリマインダーを送る",
        remindFriendsText: "友達が審査を完了できるようサポートしましょう！",
        remindBtn: "WhatsAppリマインダーを送る",
        tpGlobal: "TPグローバル",
        followMalaysia: "TPマレーシア",
        followThailand: "TPタイ",
        noReferrals: "該当する紹介は見つかりませんでした",
        referralName: "友達の名前",
        referralEmail: "メール",
        referralStage: "ステージ",
        referralStatus: "状態",
        referralDate: "申込日",
        referralDays: "ステージ日数",
        referralAction: "操作",
        statusReceived: "申込受付",
        statusAssessment: "審査ステージ",
        statusTalent: "面接ステージ",
        statusOperations: "最終レビュー",
        statusProbation: "採用（試用期間中）",
        statusPassed: "採用（確定）",
        statusFailed: "不採用",
        statusPreviouslyApplied: "以前に応募済み（支払い対象外）",
        statusHiredConfirmed: "採用（確定）",
        statusHiredProbation: "採用（試用期間中）",
        statusPreviouslyAppliedNoPayment: "以前に応募済み（支払い対象外）",
        statusFinalReview: "最終レビュー",
        statusInterviewStage: "面接ステージ",
        statusAssessmentStage: "審査ステージ",
        statusApplicationReceived: "申込受付",
        statusNotSelected: "不採用",
        paymentNote: "支払い情報",
        paymentTermsTitle: "支払い条件",
        paymentTermsText1: "支払いは登録された電話番号にリンクされたTnG電子財布に行われます。",
        paymentTermsText2: "候補者が審査を通過するとRM50が支払われます。RM750のボーナスは、紹介された候補者が90日の試用期間を無事に完了した後にのみ支払われます。",
        paymentTermsText3: "すべての支払いは確認が必要であり、試用期間完了後最大30日かかる場合があります。",
        closeBtn: "閉じる",
        questionsTitle: "質問がありますか？",
        contactUsText: "メールでお問い合わせ:",
        statusAssessmentPassed: "審査通過 (RM50)",
        noRemindersNeeded: "すべての友達が順調です！",
        filteredViewLabel: "簡易ステータス表示",
        userNotFoundTitle: "紹介が見つかりません",
        userNotFoundText1: "提供されたメールアドレスと電話番号で紹介が見つかりませんでした。",
        userNotFoundText2: "情報を再確認するか、サポートにお問い合わせください。",
        okBtn: "OK",
        contactUsBtn: "お問い合わせ",
        errorTitle: "エラー",
        errorMessage: "紹介の取得に失敗しました。後でもう一度お試しください。",
        previouslyAppliedNote: "注意:",
        previouslyAppliedNoteText: "候補者が以前にTPに応募していた場合、支払いは行われません"
    },
    ko: {
        pageLangLabel: "언어 선택:",
        dashboardTitle: "추천 대시보드",
        dashboardSubtitle: "추천 현황을 보려면 정보 입력",
        phoneLabel: "전화번호:",
        phonePlaceholder: "전화번호 입력 (01XXXXXXXX)",
        phoneError: "유효한 전화번호 입력 (01XXXXXXXX)",
        emailLabel: "이메일 주소:",
        emailPlaceholder: "이메일 주소 입력",
        emailError: "유효한 이메일 주소 입력",
        viewStatusBtn: "추천 현황 보기",
        backToRAF: "추천 양식으로 돌아가기",
        yourReferralsTitle: "귀하의 추천",
        backBtn: "뒤로",
        totalReferrals: "총 추천 수",
        hiredReferrals: "채용됨",
        inProgress: "진행 중",
        statusDistribution: "상태 분포",
        earningsTitle: "귀하의 수익",
        earningsStage: "단계",
        earningsAmount: "금액 (RM)",
        earningsCount: "카운트",
        earningsTotal: "합계",
        remindFriendsTitle: "친구들에게 알림 보내기",
        remindFriendsText: "친구들이 평가를 완료할 수 있도록 도와주세요!",
        remindBtn: "WhatsApp 알림 보내기",
        tpGlobal: "TP 글로벌",
        followMalaysia: "TP 말레이시아",
        followThailand: "TP 태국",
        noReferrals: "일치하는 추천 없음",
        referralName: "친구 이름",
        referralEmail: "이메일",
        referralStage: "단계",
        referralStatus: "상태",
        referralDate: "신청 날짜",
        referralDays: "단계 일수",
        referralAction: "조치",
        statusReceived: "신청서 접수",
        statusAssessment: "평가 단계",
        statusTalent: "면접 단계",
        statusOperations: "최종 검토",
        statusProbation: "채용 (수습 기간)",
        statusPassed: "채용 (확정)",
        statusFailed: "미채용",
        statusPreviouslyApplied: "이전 지원자 (지급 불가)",
        statusHiredConfirmed: "채용 (확정)",
        statusHiredProbation: "채용 (수습 기간)",
        statusPreviouslyAppliedNoPayment: "이전 지원자 (지급 불가)",
        statusFinalReview: "최종 검토",
        statusInterviewStage: "면접 단계",
        statusAssessmentStage: "평가 단계",
        statusApplicationReceived: "신청서 접수",
        statusNotSelected: "미채용",
        paymentNote: "결제 정보",
        paymentTermsTitle: "결제 조건",
        paymentTermsText1: "결제는 등록된 전화번호에 연결된 TnG 전자지갑으로 진행됩니다.",
        paymentTermsText2: "후보자가 평가를 통과하면 RM50이 지급됩니다。RM750 보너스는 추천한 후보자가 90일 수습 기간을 성공적으로 완료한 후에만 지급됩니다.",
        paymentTermsText3: "모든 결제는 확인이 필요하며 수습 기간 완료 후 최대 30일이 소요될 수 있습니다.",
        closeBtn: "닫기",
        questionsTitle: "질문이 있으신가요?",
        contactUsText: "이메일로 문의:",
        statusAssessmentPassed: "평가 통과 (RM50)",
        noRemindersNeeded: "모든 친구들이 순조롭게 진행 중입니다!",
        filteredViewLabel: "간략한 상태 보기",
        userNotFoundTitle: "추천을 찾을 수 없음",
        userNotFoundText1: "제공된 이메일과 전화번호로 추천을 찾을 수 없습니다.",
        userNotFoundText2: "정보를 다시 확인하거나 지원팀에 문의하세요.",
        okBtn: "확인",
        contactUsBtn: "문의하기",
        errorTitle: "오류",
        errorMessage: "추천을 가져오지 못했습니다. 나중에 다시 시도하세요.",
        previouslyAppliedNote: "참고:",
        previouslyAppliedNoteText: "후보자가 이전에 TP에 지원한 경우 지급되지 않습니다"
    },
    "zh-CN": {
        pageLangLabel: "选择语言:",
        dashboardTitle: "推荐仪表板",
        dashboardSubtitle: "输入信息查看推荐状态",
        phoneLabel: "电话号码:",
        phonePlaceholder: "输入电话号码 (01XXXXXXXX)",
        phoneError: "请输入有效电话号码 (01XXXXXXXX)",
        emailLabel: "电子邮件:",
        emailPlaceholder: "输入电子邮件",
        emailError: "请输入有效电子邮件",
        viewStatusBtn: "查看推荐状态",
        backToRAF: "返回推荐表格",
        yourReferralsTitle: "您的推荐",
        backBtn: "返回",
        totalReferrals: "总推荐数",
        hiredReferrals: "已雇用",
        inProgress: "进行中",
        statusDistribution: "状态分布",
        earningsTitle: "您的收益",
        earningsStage: "阶段",
        earningsAmount: "金额 (RM)",
        earningsCount: "计数",
        earningsTotal: "总计",
        remindFriendsTitle: "提醒您的朋友",
        remindFriendsText: "帮助您的朋友完成评估加入TP！",
        remindBtn: "发送WhatsApp提醒",
        tpGlobal: "TP全球",
        followMalaysia: "TP马来西亚",
        followThailand: "TP泰国",
        noReferrals: "未找到匹配推荐",
        referralName: "朋友姓名",
        referralEmail: "电子邮件",
        referralStage: "阶段",
        referralStatus: "状态",
        referralDate: "申请日期",
        referralDays: "阶段天数",
        referralAction: "操作",
        statusReceived: "已收申请",
        statusAssessment: "评估阶段",
        statusTalent: "面试阶段",
        statusOperations: "最终审核",
        statusProbation: "雇用（试用期）",
        statusPassed: "雇用（确定）",
        statusFailed: "未通过",
        statusPreviouslyApplied: "之前申请过 (不支付)",
        statusHiredConfirmed: "雇用（确定）",
        statusHiredProbation: "雇用（试用期）",
        statusPreviouslyAppliedNoPayment: "之前申请过 (不支付)",
        statusFinalReview: "最终审核",
        statusInterviewStage: "面试阶段",
        statusAssessmentStage: "评估阶段",
        statusApplicationReceived: "已收申请",
        statusNotSelected: "未通过",
        paymentNote: "支付信息",
        paymentTermsTitle: "支付条款",
        paymentTermsText1: "款项将支付至与您电话号码关联的TnG电子钱包。",
        paymentTermsText2: "候选人通过评估后将支付RM50。RM750奖金仅在您推荐的候选人成功完成90天试用期后支付。",
        paymentTermsText3: "所有付款需经核实，可能在试用期完成后最多30天内完成。",
        closeBtn: "关闭",
        questionsTitle: "有问题吗？",
        contactUsText: "发送邮件至:",
        statusAssessmentPassed: "评估通过 (RM50)",
        noRemindersNeeded: "您的朋友们都在正常进行中！",
        filteredViewLabel: "简化状态视图",
        userNotFoundTitle: "未找到推荐",
        userNotFoundText1: "使用提供的电子邮件和电话号码未找到任何推荐。",
        userNotFoundText2: "请仔细检查您的信息或联系我们寻求帮助。",
        okBtn: "确定",
        contactUsBtn: "联系我们",
        errorTitle: "错误",
        errorMessage: "获取推荐失败。请稍后再试。",
        previouslyAppliedNote: "注意:",
        previouslyAppliedNoteText: "如果候选人之前申请过TP，将不会支付"
    },
    "zh-HK": {
        pageLangLabel: "選擇語言:",
        dashboardTitle: "推薦儀表板",
        dashboardSubtitle: "輸入信息查看推薦狀態",
        phoneLabel: "電話號碼:",
        phonePlaceholder: "輸入電話號碼 (01XXXXXXXX)",
        phoneError: "請輸入有效電話號碼 (01XXXXXXXX)",
        emailLabel: "電子郵件:",
        emailPlaceholder: "輸入電子郵件",
        emailError: "請輸入有效電子郵件",
        viewStatusBtn: "查看推薦狀態",
        backToRAF: "返回推薦表格",
        yourReferralsTitle: "您的推薦",
        backBtn: "返回",
        totalReferrals: "總推薦數",
        hiredReferrals: "已僱用",
        inProgress: "進行中",
        statusDistribution: "狀態分佈",
        earningsTitle: "您的收益",
        earningsStage: "階段",
        earningsAmount: "金額 (RM)",
        earningsCount: "計數",
        earningsTotal: "總計",
        remindFriendsTitle: "提醒您的朋友",
        remindFriendsText: "幫助您的朋友完成評估加入TP！",
        remindBtn: "發送WhatsApp提醒",
        tpGlobal: "TP全球",
        followMalaysia: "TP馬來西亞",
        followThailand: "TP泰國",
        noReferrals: "未找到匹配推薦",
        referralName: "朋友姓名",
        referralEmail: "電子郵件",
        referralStage: "階段",
        referralStatus: "狀態",
        referralDate: "申請日期",
        referralDays: "階段天數",
        referralAction: "操作",
        statusReceived: "已收申請",
        statusAssessment: "評估階段",
        statusTalent: "面試階段",
        statusOperations: "最終審核",
        statusProbation: "僱用（試用期）",
        statusPassed: "僱用（確定）",
        statusFailed: "未通過",
        statusPreviouslyApplied: "之前申請過 (不支付)",
        statusHiredConfirmed: "僱用（確定）",
        statusHiredProbation: "僱用（試用期）",
        statusPreviouslyAppliedNoPayment: "之前申請過 (不支付)",
        statusFinalReview: "最終審核",
        statusInterviewStage: "面試階段",
        statusAssessmentStage: "評估階段",
        statusApplicationReceived: "已收申請",
        statusNotSelected: "未通過",
        paymentNote: "支付信息",
        paymentTermsTitle: "支付條款",
        paymentTermsText1: "款項將支付至與您電話號碼關聯的TnG電子錢包。",
        paymentTermsText2: "候選人通過評估後將支付RM50。RM750獎金僅在您推薦的候選人成功完成90天試用期後支付。",
        paymentTermsText3: "所有付款需經核實，可能在試用期完成後最多30天內完成。",
        closeBtn: "關閉",
        questionsTitle: "有問題嗎？",
        contactUsText: "發送郵件至:",
        statusAssessmentPassed: "評估通過 (RM50)",
        noRemindersNeeded: "您的朋友們都在正常進行中！",
        filteredViewLabel: "簡化狀態視圖",
        userNotFoundTitle: "未找到推薦",
        userNotFoundText1: "使用提供的電子郵件和電話號碼未找到任何推薦。",
        userNotFoundText2: "請仔細檢查您的信息或聯繫我們尋求幫助。",
        okBtn: "確定",
        contactUsBtn: "聯繫我們",
        errorTitle: "錯誤",
        errorMessage: "獲取推薦失敗。請稍後再試。",
        previouslyAppliedNote: "注意:",
        previouslyAppliedNoteText: "如果候選人之前申請過TP，將不會支付"
    }
};

// Earnings structure
const earningsStructure = {
    assessment: {
        amount: 50,
        label: "Pass Assessment",
        description: "Paid when candidate passes assessment"
    },
    probation: { 
        amount: 750, 
        label: "Pass Probation (90 days)",
        description: "Paid only for new candidates who complete 90 days"
    }
};// Main Application Script with SharePoint Integration
document.addEventListener('DOMContentLoaded', function() {
    // Application State
    const AppState = {
        currentLanguage: 'en',
        statusChart: null,
        currentReferralsData: null,
        isLoading: false,
        debugMode: false // Set to true to see detailed logs
    };
    
    // Initialize the application
    initializeApp();
    
    function initializeApp() {
        // Set current year
        document.getElementById('current-year').textContent = new Date().getFullYear();
        
        // Initialize translations
        updateTranslations();
        
        // Set up event listeners
        setupEventListeners();
        
        // Auto-focus phone input
        document.getElementById('dashboard-phone').focus();
        
        // Test SharePoint connection on load (optional)
        if (AppState.debugMode) {
            testConnection();
        }
    }
    
    function setupEventListeners() {
        // Language change handler
        document.getElementById('lang-select').addEventListener('change', handleLanguageChange);
        
        // Form submission
        document.getElementById('dashboard-submit').addEventListener('click', handleFormSubmit);
        
        // Phone number validation - only numbers
        document.getElementById('dashboard-phone').addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        
        // Handle remind button clicks
        document.addEventListener('click', handleReminderClick);
        
        // Add Enter key support for form
        document.getElementById('dashboard-form').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleFormSubmit();
            }
        });
    }
    
    async function testConnection() {
        console.log('Testing SharePoint connection...');
        try {
            const result = await ApiService.testSharePointConnection();
            if (result.success) {
                console.log('✓ SharePoint connection successful');
            } else {
                console.error('✗ SharePoint connection failed:', result.error);
            }
        } catch (error) {
            console.error('Connection test error:', error);
        }
    }
    
    function handleLanguageChange(e) {
        AppState.currentLanguage = e.target.value;
        updateTranslations();
        
        // Refresh UI components if data is loaded
        if (AppState.currentReferralsData) {
            updateChart(AppState.currentReferralsData);
            updateEarningsTable(AppState.currentReferralsData);
            updateReminderSection(AppState.currentReferralsData);
            updateReferralList(AppState.currentReferralsData);
        }
    }
    
    async function handleFormSubmit() {
        const phone = document.getElementById('dashboard-phone').value.trim();
        const email = document.getElementById('dashboard-email').value.trim();
        
        // Validate inputs
        if (!validateInputs(phone, email)) {
            return;
        }
        
        // Set loading state
        setLoadingState(true);
        
        try {
            // Fetch data from SharePoint
            const referrals = await ApiService.fetchReferrals(phone, email);
            
            if (!referrals || referrals.length === 0) {
                showUserNotFoundModal();
                return;
            }
            
            // Process referrals with status mapping
            const processedReferrals = processReferrals(referrals);
            
            // Store in app state
            AppState.currentReferralsData = processedReferrals;
            
            // Show results
            showReferralResults(processedReferrals, phone, email);
            
        } catch (error) {
            console.error('Error:', error);
            
            // Check if it's an authentication error
            if (error.message.includes('401') || error.message.includes('403')) {
                showErrorModal(
                    'Authentication required. Please ensure you are logged into SharePoint and have the necessary permissions.'
                );
            } else if (error.message.includes('404')) {
                showErrorModal(
                    'SharePoint lists not found. Please contact your administrator to verify the list configuration.'
                );
            } else {
                showErrorModal(
                    translations[AppState.currentLanguage].errorMessage || 
                    'Failed to fetch referrals. Please try again later.'
                );
            }
        } finally {
            setLoadingState(false);
        }
    }
    
    function processReferrals(referrals) {
        return referrals.map(referral => {
            // Status mapping is already done in the API service
            // Just ensure all required fields are present
            const mappedStatus = StatusMapping.mapStatusToGroup(referral.status || referral.Status);
            const statusType = referral.statusType || StatusMapping.getSimplifiedStatusType(referral.status || referral.Status);
            const stage = referral.stage || StatusMapping.determineStage(mappedStatus);
            
            return {
                ...referral,
                mappedStatus,
                statusType,
                stage,
                // Ensure consistent field names
                name: referral.name || referral.First_Name || 'Unknown',
                email: referral.email || referral.Email || '',
                status: referral.status || referral.Status || 'Unknown',
                daysInStage: referral.daysInStage || 0,
                isPreviousCandidate: referral.isPreviousCandidate || false,
                needsAction: referral.needsAction || false
            };
        });
    }
    
    function validateInputs(phone, email) {
        let isValid = true;
        
        // Validate phone
        if (!phone) {
            showError(document.getElementById('dashboard-phone'), 
                     translations[AppState.currentLanguage].phoneError);
            isValid = false;
        } else if (!validatePhone(phone)) {
            showError(document.getElementById('dashboard-phone'), 
                     translations[AppState.currentLanguage].phoneError);
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-phone'));
        }
        
        // Validate email
        if (!email) {
            showError(document.getElementById('dashboard-email'), 
                     translations[AppState.currentLanguage].emailError);
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(document.getElementById('dashboard-email'), 
                     translations[AppState.currentLanguage].emailError);
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-email'));
        }
        
        return isValid;
    }
    
    function validatePhone(phone) {
        const regex = /^01\d{8,9}$/;
        return regex.test(phone);
    }
    
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
        return regex.test(email) && email.length <= 254;
    }
    
    function showError(input, message) {
        const formControl = input.closest('.mb-3');
        const error = formControl.querySelector('.invalid-feedback');
        
        formControl.classList.add('was-validated');
        error.textContent = message;
        error.style.display = 'block';
        input.classList.add('is-invalid');
    }
    
    function clearError(input) {
        const formControl = input.closest('.mb-3');
        const error = formControl.querySelector('.invalid-feedback');
        
        formControl.classList.remove('was-validated');
        error.style.display = 'none';
        input.classList.remove('is-invalid');
    }
    
    function setLoadingState(isLoading) {
        AppState.isLoading = isLoading;
        const submitBtn = document.getElementById('dashboard-submit');
        
        if (isLoading) {
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading...';
            submitBtn.disabled = true;
        } else {
            submitBtn.innerHTML = translations[AppState.currentLanguage].viewStatusBtn;
            submitBtn.disabled = false;
        }
    }
    
    function showUserNotFoundModal() {
        const modal = new bootstrap.Modal(document.getElementById('userNotFoundModal'));
        modal.show();
    }
    
    function showErrorModal(message) {
        document.getElementById('error-message').textContent = message;
        const modal = new bootstrap.Modal(document.getElementById('errorModal'));
        modal.show();
    }
    
    function showReferralResults(referrals, phone, email) {
        document.getElementById('auth-step').style.display = 'none';
        document.getElementById('results-step').style.display = 'block';
        
        // Extract user name from first referral or use email
        const userName = referrals[0]?.employee || referrals[0]?.name || email.split('@')[0];
        
        // Create results content
        const resultsContent = createResultsContent(userName, referrals);
        document.getElementById('results-step').innerHTML = resultsContent;
        
        // Update all components
        updateChart(referrals);
        updateEarningsTable(referrals);
        updateReminderSection(referrals);
        updateReferralList(referrals);
        
        // Re-attach event listeners
        document.getElementById('dashboard-back').addEventListener('click', handleBackButton);
        document.getElementById('filteredViewToggle').addEventListener('change', handleFilterToggle);
        
        // Add debug button if in debug mode
        if (AppState.debugMode) {
            addDebugButton();
        }
        
        // Update translations
        updateTranslations();
    }
    
    function createResultsContent(userName, referrals) {
        const hiredCount = referrals.filter(r => r.stage === 'Hired').length;
        const inProgressCount = referrals.filter(r => 
            r.stage !== 'Hired' && 
            r.stage !== 'Not Selected' && 
            r.stage !== 'Eliminated'
        ).length;
        
        return `
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h3 class="user-name-display">${userName}</h3>
                    <h4 data-translate="yourReferralsTitle">Your Referrals</h4>
                </div>
                <button id="dashboard-back" class="btn btn-outline-secondary" data-translate="backBtn">
                    <i class="fas fa-arrow-left me-2"></i> Back
                </button>
            </div>
            
            <div id="referral-stats" class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="totalReferrals">Total Referrals</h5>
                            <h3 class="text-primary" id="total-referrals">${referrals.length}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="hiredReferrals">Hired</h5>
                            <h3 class="text-success" id="hired-referrals">${hiredCount}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="inProgress">In Progress</h5>
                            <h3 class="text-warning" id="progress-referrals">${inProgressCount}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mb-3">
                <div class="card-body">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="filteredViewToggle">
                        <label class="form-check-label" for="filteredViewToggle" data-translate="filteredViewLabel">Simplified Status View</label>
                    </div>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="statusDistribution">Status Distribution</h5>
                    <div class="chart-container" style="height: 300px; width: 100%; margin: 0 auto;">
                        <canvas id="statusChart"></canvas>
                        <img src="TPLogo11.png" class="chart-logo" alt="TP Logo">
                    </div>
                    <div class="chart-legend text-center mt-3" id="chartLegend"></div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="earningsTitle">Your Earnings</h5>
                    <div class="table-responsive">
                        <table class="earnings-table">
                            <thead>
                                <tr>
                                    <th data-translate="earningsStage">Stage</th>
                                    <th data-translate="earningsAmount">Amount (RM)</th>
                                    <th data-translate="earningsCount">Count</th>
                                    <th data-translate="earningsTotal">Total</th>
                                </tr>
                            </thead>
                            <tbody id="earnings-body"></tbody>
                            <tfoot>
                                <tr>
                                    <th data-translate="earningsTotal">Total Earnings</th>
                                    <th></th>
                                    <th></th>
                                    <th id="total-earnings">RM 0</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="text-center mt-3">
                        <button type="button" class="btn btn-link" data-bs-toggle="modal" data-bs-target="#tngModal" data-translate="paymentNote">
                            Payment Terms & Conditions
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="reminder-section" class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="remindFriendsTitle">Remind Your Friends</h5>
                    <p class="text-center" data-translate="remindFriendsText">Help your friends complete their assessments to join TP!</p>
                    <div id="friends-to-remind" class="row"></div>
                </div>
            </div>
            
            <div id="referral-list"></div>
            
            ${AppState.debugMode ? '<div id="debug-section" class="mt-3"></div>' : ''}
            
            <!-- Social Media -->
            <div class="mt-4">
                <div class="row text-center">
                    <!-- TP Global -->
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="tpGlobal">TP Global</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="https://www.linkedin.com/company/teleperformance" class="social-icon" target="_blank"><i class="fab fa-linkedin"></i></a>
                            <a href="https://www.youtube.com/@TeleperformanceGroup" class="social-icon" target="_blank"><i class="fab fa-youtube"></i></a>
                            <a href="https://www.tiktok.com/@teleperformance_group" class="social-icon" target="_blank"><i class="fab fa-tiktok"></i></a>
                        </div>
                    </div>
                    <!-- TP Malaysia -->
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="followMalaysia">TP Malaysia</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="https://www.facebook.com/TPinMalaysia/" class="social-icon" target="_blank"><i class="fab fa-facebook-f"></i></a>
                            <a href="http://www.instagram.com/tp_malaysia/" class="social-icon" target="_blank"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                    <!-- TP Thailand -->
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="followThailand">TP Thailand</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="http://www.facebook.com/TPinThailand/" class="social-icon" target="_blank"><i class="fab fa-facebook-f"></i></a>
                            <a href="http://www.instagram.com/tpinthailand/" class="social-icon" target="_blank"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function addDebugButton() {
        const debugSection = document.getElementById('debug-section');
        if (debugSection) {
            debugSection.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5>Debug Tools</h5>
                        <button class="btn btn-sm btn-info me-2" onclick="window.ApiService.debugListFields('candidate')">
                            Debug Candidate Fields
                        </button>
                        <button class="btn btn-sm btn-info me-2" onclick="window.ApiService.debugListFields('assessment')">
                            Debug Assessment Fields
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="console.log(window.AppState)">
                            Log App State
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    function handleBackButton() {
        document.getElementById('auth-step').style.display = 'block';
        document.getElementById('results-step').style.display = 'none';
        AppState.currentReferralsData = null;
        
        // Clear form inputs
        document.getElementById('dashboard-phone').value = '';
        document.getElementById('dashboard-email').value = '';
        
        // Focus on phone input
        document.getElementById('dashboard-phone').focus();
    }
    
    function handleFilterToggle() {
        if (AppState.currentReferralsData) {
            updateChart(AppState.currentReferralsData);
            updateReferralList(AppState.currentReferralsData);
        }
    }
    
    function handleReminderClick(e) {
        if (e.target.classList.contains('remind-btn') || e.target.closest('.remind-btn')) {
            const button = e.target.classList.contains('remind-btn') ? e.target : e.target.closest('.remind-btn');
            const name = button.dataset.name;
            const phone = button.dataset.phone;
            
            // Format phone number for WhatsApp (remove leading 0 and add country code)
            const formattedPhone = phone.startsWith('0') ? '6' + phone : phone;
            
            const message = `Hi ${name}, this is a reminder to complete your TP assessment. ` +
                           `We're excited about your application! Please complete it at your earliest convenience. ` +
                           `If you need any help, feel free to ask me.`;
            
            window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
        }
    }
    
    function updateChart(referrals) {
        const ctx = document.getElementById('statusChart').getContext('2d');
        const translation = translations[AppState.currentLanguage] || translations.en;
        
        // Check if filtered view is enabled
        const filteredView = document.getElementById('filteredViewToggle')?.checked || false;
        
        // Count statuses
        let statusCounts = {};
        
        if (filteredView) {
            // Use the simplified status groups
            StatusMapping.displayOrder.forEach(group => {
                statusCounts[group] = referrals.filter(r => StatusMapping.mapStatusToGroup(r.status) === group).length;
            });
        } else {
            // Original status counting
            statusCounts = {
                passed: referrals.filter(r => r.statusType === 'passed').length,
                probation: referrals.filter(r => r.statusType === 'probation').length,
                previouslyApplied: referrals.filter(r => r.statusType === 'previouslyApplied').length,
                operations: referrals.filter(r => r.statusType === 'operations').length,
                talent: referrals.filter(r => r.statusType === 'talent').length,
                assessment: referrals.filter(r => r.statusType === 'assessment').length,
                received: referrals.filter(r => r.statusType === 'received').length,
                failed: referrals.filter(r => r.statusType === 'failed').length
            };
        }
        
        // Chart data
        const data = createChartData(statusCounts, filteredView, translation);
        
        // Destroy previous chart if exists
        if (AppState.statusChart) {
            AppState.statusChart.destroy();
        }
        
        // Create new chart
        AppState.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: getChartOptions()
        });
        
        // Create custom legend
        createChartLegend(data);
    }
    
    function createChartData(statusCounts, filteredView, translation) {
        if (filteredView) {
            return {
                labels: StatusMapping.displayOrder.map(group => {
                    const translationKey = `status${group.replace(/\s+/g, '').replace(/[()]/g, '')}`;
                    return translation[translationKey] || group;
                }),
                datasets: [{
                    data: StatusMapping.displayOrder.map(group => statusCounts[group] || 0),
                    backgroundColor: [
                        '#28a745', '#7cb342', '#6c757d', '#ffc107',
                        '#fd7e14', '#17a2b8', '#6c757d', '#dc3545'
                    ],
                    borderWidth: 1,
                    hoverOffset: 20
                }]
            };
        } else {
            return {
                labels: [
                    translation.statusPassed,
                    translation.statusProbation,
                    translation.statusPreviouslyApplied,
                    translation.statusOperations,
                    translation.statusTalent,
                    translation.statusAssessment,
                    translation.statusReceived,
                    translation.statusFailed
                ],
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#28a745', '#7cb342', '#6c757d', '#ffc107',
                        '#fd7e14', '#17a2b8', '#6c757d', '#dc3545'
                    ],
                    borderWidth: 1,
                    hoverOffset: 20
                }]
            };
        }
    }
    
    function getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };
    }
    
    function createChartLegend(data) {
        const legendContainer = document.getElementById('chartLegend');
        legendContainer.innerHTML = '';
        
        data.labels.forEach((label, i) => {
            if (data.datasets[0].data[i] > 0) { // Only show legend items with data
                const legendItem = document.createElement('span');
                legendItem.className = 'd-inline-block mx-2 mb-1';
                legendItem.innerHTML = `
                    <span class="d-inline-block me-1" style="width: 12px; height: 12px; background-color: ${data.datasets[0].backgroundColor[i]}; border-radius: 2px;"></span>
                    ${label}
                `;
                legendContainer.appendChild(legendItem);
            }
        });
    }
    
    function updateEarningsTable(referrals) {
        const earningsBody = document.getElementById('earnings-body');
        earningsBody.innerHTML = '';
        
        let totalEarnings = 0;
        
        // Calculate earnings based on status and days
        const assessmentPasses = referrals.filter(r => {
            // Check if passed assessment (hired or in later stages)
            const passedAssessment = ['passed', 'probation', 'operations', 'talent'].includes(r.statusType) ||
                                    r.stage === 'Hired' || 
                                    r.stage === 'Interview' ||
                                    r.stage === 'Final Review';
            return passedAssessment && !r.isPreviousCandidate;
        });
        
        const probationCompletions = referrals.filter(r => 
            r.statusType === 'passed' && 
            r.daysInStage >= 90 && 
            !r.isPreviousCandidate
        );
        
        // Add rows for each earning type
        Object.entries(earningsStructure).forEach(([key, earning]) => {
            const count = key === 'assessment' ? assessmentPasses.length : probationCompletions.length;
            const total = count * earning.amount;
            totalEarnings += total;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${translations[AppState.currentLanguage][`status${key.charAt(0).toUpperCase() + key.slice(1)}`] || earning.label}</td>
                <td>RM ${earning.amount}</td>
                <td>${count}</td>
                <td>RM ${total}</td>
            `;
            earningsBody.appendChild(row);
        });
        
        // Update total earnings
        document.getElementById('total-earnings').textContent = `RM ${totalEarnings}`;
    }
    
    function updateReminderSection(referrals) {
        const friendsToRemind = document.getElementById('friends-to-remind');
        friendsToRemind.innerHTML = '';
        
        // Filter friends needing reminder
        const friendsNeedingReminder = referrals
            .filter(r => r.needsAction && !r.isPreviousCandidate)
            .sort((a, b) => {
                const statusOrder = ['assessment', 'talent', 'operations', 'received'];
                return statusOrder.indexOf(a.statusType) - statusOrder.indexOf(b.statusType);
            });
        
        if (friendsNeedingReminder.length === 0) {
            friendsToRemind.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted" data-translate="noRemindersNeeded">All your friends are on track!</p>
                </div>
            `;
            updateTranslations();
            return;
        }
        
        friendsNeedingReminder.forEach(friend => {
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-3';
            
            // Extract phone number
            const phoneNumber = friend.employee || friend.Employee || '0123456789';
            
            col.innerHTML = `
                <div class="friend-to-remind status-${friend.statusType}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5>${friend.name}</h5>
                        <span class="badge status-badge bg-${getStatusBadgeColor(friend.statusType)}">
                            ${translations[AppState.currentLanguage][`status${friend.statusType.charAt(0).toUpperCase() + friend.statusType.slice(1)}`]}
                        </span>
                    </div>
                    <p class="small text-muted mb-2">${friend.email}</p>
                    <p class="small mb-2"><strong>${translations[AppState.currentLanguage].referralDays}:</strong> ${friend.daysInStage}</p>
                    <button class="btn btn-sm btn-primary w-100 remind-btn" 
                            data-name="${friend.name}" 
                            data-phone="${phoneNumber}" 
                            data-translate="remindBtn">
                        <i class="fab fa-whatsapp me-2"></i>${translations[AppState.currentLanguage].remindBtn}
                    </button>
                </div>
            `;
            
            friendsToRemind.appendChild(col);
        });
    }
    
    function updateReferralList(referrals) {
        const referralList = document.getElementById('referral-list');
        referralList.innerHTML = '';
        
        if (referrals.length === 0) {
            referralList.innerHTML = `
                <div class="alert alert-info" data-translate="noReferrals">
                    ${translations[AppState.currentLanguage].noReferrals}
                </div>
            `;
            updateTranslations();
            return;
        }
        
        // Check if filtered view is enabled
        const filteredView = document.getElementById('filteredViewToggle')?.checked || false;
        
        // Process and sort referrals
        const processedReferrals = processReferralsForDisplay(referrals, filteredView);
        
        processedReferrals.forEach(referral => {
            const item = createReferralListItem(referral);
            referralList.appendChild(item);
        });
        
        updateTranslations();
    }
    
    function processReferralsForDisplay(referrals, filteredView) {
        const processed = referrals.map(r => {
            if (filteredView) {
                return {
                    ...r,
                    displayStatus: StatusMapping.mapStatusToGroup(r.status),
                    displayStatusType: StatusMapping.getSimplifiedStatusType(r.status)
                };
            }
            return {
                ...r,
                displayStatus: r.status,
                displayStatusType: r.statusType
            };
        });
        
        // Sort by status order
        const statusOrder = filteredView ? 
            StatusMapping.displayOrder : 
            ['passed', 'probation', 'previouslyApplied', 'operations', 'talent', 'assessment', 'received', 'failed'];
            
        return processed.sort((a, b) => {
            const aIndex = statusOrder.indexOf(filteredView ? a.displayStatus : a.displayStatusType);
            const bIndex = statusOrder.indexOf(filteredView ? b.displayStatus : b.displayStatusType);
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });
    }
    
    function createReferralListItem(referral) {
        const item = document.createElement('div');
        const statusKey = `status${referral.displayStatusType.charAt(0).toUpperCase() + referral.displayStatusType.slice(1)}`;
        const statusTranslation = translations[AppState.currentLanguage][statusKey] || referral.displayStatus;
        
        // Determine if payment is eligible
        const isPaymentEligible = referral.statusType === 'passed' && 
                                  referral.daysInStage >= 90 && 
                                  !referral.isPreviousCandidate;
        
        // Extract phone number if available
        const phoneNumber = referral.employee || referral.Employee || '0123456789';
        
        item.className = `card mb-3 status-${referral.displayStatusType} ${isPaymentEligible ? 'payment-eligible' : ''}`;
        
        // Add assessment info if available
        const assessmentInfo = referral.assessmentCEFR ? 
            `<p class="mb-1 text-muted small">CEFR: ${referral.assessmentCEFR} | Score: ${referral.assessmentScore || 'N/A'}</p>` : '';
        
        item.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="mb-1">${referral.name}</h5>
                        <p class="mb-1 text-muted small">${referral.email}</p>
                        ${referral.personId || referral.Person_system_id ? 
                            `<p class="mb-1 text-muted small">ID: ${referral.personId || referral.Person_system_id}</p>` : ''}
                        ${assessmentInfo}
                    </div>
                    <span class="badge status-badge bg-${getStatusBadgeColor(referral.displayStatusType, referral.daysInStage, referral.isPreviousCandidate)}">
                        ${statusTranslation}
                    </span>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <small class="text-muted" data-translate="referralStage">Stage</small>
                        <p>${referral.stage}</p>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted">Location</small>
                        <p>${referral.location || referral.Location || 'N/A'}</p>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted" data-translate="referralDays">Days in Stage</small>
                        <p>${referral.daysInStage}</p>
                    </div>
                    <div class="col-md-3">
                        ${referral.needsAction && !referral.isPreviousCandidate ? `
                        <button class="btn btn-sm btn-primary w-100 remind-btn" 
                                data-name="${referral.name}" 
                                data-phone="${phoneNumber}" 
                                data-translate="remindBtn">
                            <i class="fab fa-whatsapp me-2"></i>${translations[AppState.currentLanguage].remindBtn}
                        </button>
                        ` : ''}
                    </div>
                </div>
                ${referral.source || referral.Source ? `
                <div class="mt-2">
                    <small class="text-muted">Source: ${referral.sourceName || referral.SourceName || referral.source || referral.Source}</small>
                </div>
                ` : ''}
            </div>
        `;
        
        return item;
    }
    
    function getStatusBadgeColor(statusType, daysInStage = 0, isPreviousCandidate = false) {
        if (isPreviousCandidate) {
            return 'previously-applied';
        }
        
        switch(statusType) {
            case 'passed':
                return daysInStage >= 90 ? 'success' : 'warning';
            case 'probation':
                return 'warning';
            case 'previouslyApplied':
                return 'previously-applied';
            case 'assessment':
            case 'talent':
            case 'operations':
                return 'warning';
            case 'failed':
                return 'danger';
            default:
                return 'secondary';
        }
    }
    
    function updateTranslations() {
        const translation = translations[AppState.currentLanguage] || translations.en;
        
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translation[key]) {
                el.textContent = translation[key];
            }
        });
        
        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            if (translation[key]) {
                el.placeholder = translation[key];
            }
        });
    }
    
    // Make AppState available globally for debugging
    window.AppState = AppState;
});

// Translations
const translations = {
