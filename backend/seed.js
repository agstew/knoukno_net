require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');
const Business = require('./models/Business');

const businesses = [
  { title: 'Starting Your Business', description: 'Foundational steps and decisions for launching a business', category: 'start' },
  { title: 'Managing Operations', description: 'Day-to-day operations, processes, and systems management', category: 'manage' },
  { title: 'Business Finances', description: 'Financial management, cash flow, accounting, and funding', category: 'money' },
  { title: 'Employee Management', description: 'Hiring, training, performance management, and team building', category: 'manage' },
  { title: 'Business Growth', description: 'Scaling strategies, market expansion, and growth planning', category: 'manage' }
];

const questions = [
  {
    businessTitle: 'Business Finances',
    questionText: 'When a business has irregular monthly revenue and fixed operational costs including rent, utilities, payroll, and vendor payments, how do you establish a cash flow management system that prevents insolvency during low-revenue months? Consider that you must maintain employee pay schedules, honor vendor contracts, and keep utility services active while simultaneously trying to reinvest in inventory or services. What specific financial tools, reserve fund strategies, and payment prioritization methods would you implement to navigate a 60-day period where incoming revenue drops by 40% while expenses remain constant? Describe the step-by-step process you would follow from the moment you identify the revenue shortfall through to stabilizing operations, including which expenses get deferred, which financial instruments you would leverage, and how you communicate with stakeholders during the crisis.',
    example: 'A retail business averages $15,000/month but drops to $9,000 for two months during off-season while monthly costs stay at $12,000.',
    category: 'money',
    tierAccess: 'members',
    questionNumber: 1
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'A business collects revenue in cash and through digital payments but has multiple expense categories that each need to be tracked separately for tax, budgeting, and reporting purposes. How do you design and implement an accounting system from scratch that gives you real-time visibility into your financial health without hiring a full-time accountant? Walk through the chart of accounts you would set up, the reconciliation process you would follow weekly and monthly, the reports you would generate to make operational decisions, and how you would prepare this data for tax filing. Include how you handle mixed-use expenses, owner draws versus salary, and the documentation practices needed to withstand an audit.',
    example: 'A service business owner collects $8,000/week from clients across cash, check, and Stripe payments while paying 12 different vendors plus employee wages.',
    category: 'money',
    tierAccess: 'free',
    questionNumber: 2
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'When evaluating whether a business should take on debt financing versus seeking equity investment versus bootstrapping growth from internal cash flow, what framework do you use to make this decision? Consider factors including current debt-to-equity ratio, the cost of capital from each source, dilution impact on ownership, covenants and restrictions that come with debt, the timeline for needing capital, and the risk profile of the business model. Describe in detail how you would calculate the true cost of each financing option, what financial projections you would build to justify the decision, and what criteria would cause you to choose one path over another. Include how operational stage, industry, and market timing affect the calculus.',
    example: 'A tech startup with $200K ARR needs $500K to hire 3 engineers and launch a new product line within 8 months before a competitor does.',
    category: 'money',
    tierAccess: 'pro',
    questionNumber: 3
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How do you construct a comprehensive annual budget for a business that includes revenue forecasting, expense planning, capital expenditure decisions, and contingency reserves when your historical data is limited or unreliable? Describe the methodology for building bottom-up versus top-down budgets, how you handle multiple revenue streams with different margin profiles, how you account for seasonality and macroeconomic uncertainty, and how you build in variance thresholds that trigger a budget review. Walk through the specific spreadsheet structure or software approach you would use, the assumptions that must be documented, and how the budget connects to operational decisions throughout the year.',
    example: 'A two-year-old logistics company with three service lines and lumpy contract-based revenue needs to plan headcount, fleet, and marketing spend for the coming year.',
    category: 'money',
    tierAccess: 'members',
    questionNumber: 4
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'When launching a new business, how do you rigorously validate that sufficient market demand exists before committing significant capital to operations, inventory, or staffing? Walk through the entire validation process including how you identify your target customer segment, design and conduct customer discovery interviews, interpret the signals versus noise in the feedback, build and test a minimum viable offer, and make the go or no-go decision based on the data. Include how you distinguish between someone saying they like your idea versus someone actually paying for it, how many data points are sufficient for confidence, and what failure modes in the validation process lead entrepreneurs to false positives.',
    example: 'An entrepreneur wants to launch a premium cleaning service targeting vacation rental hosts in a mid-size market before quitting their day job.',
    category: 'start',
    tierAccess: 'free',
    questionNumber: 5
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'Choosing the right legal structure for a new business involves tradeoffs across liability protection, tax treatment, operational complexity, fundraising capability, and ownership flexibility. Walk through the decision framework for choosing between sole proprietorship, LLC, S-Corp, C-Corp, and partnership structures. For each structure, explain the specific liability protections it provides and their limits, how income flows and gets taxed at each level, the compliance and administrative burden it creates, and the types of businesses or growth trajectories it best suits. Include how state of incorporation affects the decision, when and how to convert from one structure to another, and which professional advisors should be involved at each stage.',
    example: 'A solo consultant considering their first hire and a potential outside investor must choose between remaining an LLC or electing S-Corp status while leaving room for future equity grants.',
    category: 'start',
    tierAccess: 'free',
    questionNumber: 6
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'Before opening for business, what is the complete set of operational systems, processes, and infrastructure that must be in place to handle customers, money, and work delivery reliably from day one? Describe the order of operations for setting up business banking, payment processing, invoicing, customer communication, service delivery workflows, and record-keeping. Include what technology stack you would choose and why, how you design processes that do not depend on memory or tribal knowledge, what documentation you create before the first customer arrives, and how you stress-test your systems before going live. Walk through how these foundational systems prevent the common operational failures that cause early-stage businesses to lose customers and revenue.',
    example: 'A home services company is preparing to take its first five paying customers and must have booking, payment, scheduling, and service delivery working reliably.',
    category: 'start',
    tierAccess: 'members',
    questionNumber: 7
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How do you develop a pricing strategy for a new business when you lack the cost data, competitive intelligence, and customer price sensitivity information that established companies have? Walk through the methods for calculating your true cost of goods sold and overhead allocation, researching competitive pricing in your market, testing price points with early customers, and setting prices that cover costs while positioning you correctly against alternatives. Include how to price differently for early customers versus at scale, when and how to raise prices once established, how pricing communicates quality to customers, and how to avoid the trap of underpricing to win business that ultimately destroys the unit economics of the company.',
    example: 'A new B2B software consultancy has to price a 3-month engagement without knowing their actual utilization rate, overhead allocation per project, or what competitors charge.',
    category: 'start',
    tierAccess: 'pro',
    questionNumber: 8
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you design and implement standard operating procedures for a business that relies on human labor when the work involves both routine tasks and significant judgment calls? Describe the process for documenting current workflows, identifying the critical decision points where variance causes quality problems, writing procedures that are specific enough to produce consistent results but flexible enough to handle real-world variation, and training employees to follow them. Include how you handle the difference between what people say they do and what they actually do, how you version-control your procedures as the business evolves, how you measure adherence and outcomes, and what happens when a procedure fails in a real customer situation.',
    example: 'A multi-location food service operation needs to standardize its food preparation, customer service interactions, and complaint resolution across sites with different staff.',
    category: 'manage',
    tierAccess: 'free',
    questionNumber: 9
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'When a business is experiencing quality problems that are causing customer complaints, refund requests, and negative reviews, how do you diagnose the root cause and implement a systematic fix without shutting down operations? Describe the process for distinguishing between random variation and systemic process failure, conducting a root cause analysis without triggering defensive reactions from the team, designing and testing a corrective action, implementing it at scale, and monitoring to confirm the problem is actually resolved. Include how you manage customer relationships during the remediation period, how you communicate internally about the problem without creating blame culture, and how you build quality checkpoints that catch problems before they reach customers.',
    example: 'An e-commerce fulfillment operation is receiving a 12% defect rate on orders during peak season, with wrong items shipped, damaged packaging, and missing components.',
    category: 'manage',
    tierAccess: 'members',
    questionNumber: 10
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you design a technology stack for a small-to-medium business that covers operations, customer management, communications, and financial tracking without creating a fragmented mess of disconnected tools that create data silos and manual reconciliation work? Walk through the evaluation criteria for selecting business software, how to map data flows between systems, what integrations are essential versus nice-to-have, how to manage the migration from manual processes to software without losing operational continuity, and how to build in the flexibility to change tools as the business grows. Include how to calculate the true cost of software including implementation, training, and ongoing administration, and how to avoid vendor lock-in.',
    example: 'A 15-person professional services firm is using four separate spreadsheets, two email systems, and no CRM to manage clients, projects, invoicing, and internal communications.',
    category: 'manage',
    tierAccess: 'pro',
    questionNumber: 11
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'When a business needs to scale its operational capacity to handle significantly more volume, what is the correct sequence of decisions around hiring, process improvement, automation, and capital investment? Describe how to identify the actual constraint that is limiting throughput, how to distinguish between problems that require more people versus better processes versus technology, and how to sequence investments to get the most capacity gain per dollar spent. Include how to avoid the common trap of hiring to solve process problems, how to measure operational efficiency before and after changes, and how to plan for the operational complexity that comes with each doubling of volume.',
    example: 'A manufacturing operation running at 80% utilization needs to increase monthly output by 40% within six months to fulfill a new contract without building a new facility.',
    category: 'manage',
    tierAccess: 'members',
    questionNumber: 12
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you design a compensation and benefits structure for a growing business that allows you to attract qualified candidates, retain top performers, stay competitive with the market, and manage total labor costs within budget? Walk through how to conduct a compensation benchmarking analysis, design pay bands and progression criteria, structure base pay versus variable pay versus benefits, handle pay equity across roles and tenure, and communicate compensation philosophy to the team. Include how to handle pay conversations when you cannot match market rates, how to use non-cash compensation effectively, how to build compensation reviews into the performance management calendar, and how to adjust the structure as the business scales.',
    example: 'A 20-person technology company is losing engineers to competitors paying 20-30% more and must redesign its compensation structure without blowing the payroll budget.',
    category: 'manage',
    tierAccess: 'members',
    questionNumber: 13
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'When an employee is consistently underperforming relative to the role requirements despite having the training and resources needed to succeed, how do you manage the performance improvement process in a way that is fair to the employee, legally defensible for the company, and minimally disruptive to the team? Describe the documentation requirements starting from when the issue first appears, how to structure a performance improvement plan with specific measurable expectations, how to conduct difficult conversations without triggering emotional or legal escalation, what support you provide the employee during the process, and how you make and communicate the final decision regardless of outcome. Include what you do wrong that turns a manageable performance issue into a lawsuit.',
    example: 'A sales representative with 18 months of tenure is consistently missing quota by 30% despite coaching, and their manager needs to address it formally before the next quarter.',
    category: 'manage',
    tierAccess: 'free',
    questionNumber: 14
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you build and maintain a high-performance team culture in a business that has grown from a small tight-knit group to a larger organization where not everyone knows each other personally? Describe how culture gets established and transmitted in early-stage companies, what breaks down as headcount increases, how to intentionally design cultural practices including meetings, communication norms, decision-making frameworks, and recognition systems that reinforce the values you want, and how to handle culture fit issues as you hire across different backgrounds and experience levels. Include how to measure whether your culture is actually what you think it is, how to address cultural drift without appearing authoritarian, and what culture problems predict business performance problems.',
    example: 'A company that grew from 8 to 45 employees in two years is now experiencing communication breakdowns, political behavior, and disengagement that did not exist when everyone sat in one room.',
    category: 'manage',
    tierAccess: 'pro',
    questionNumber: 15
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'What is the complete process for hiring a key role in your business from job requirements definition through the first 90 days of employment? Describe how to define the actual requirements of the role versus the wish list, write a job description that attracts the right candidates while filtering out the wrong ones, design an interview process that tests the actual skills needed, conduct structured interviews and evaluate candidates consistently, make and communicate the hiring decision, negotiate the offer, onboard the new employee effectively, and measure whether the hire is working within the first quarter. Include the most common hiring mistakes, what reference checks actually reveal versus hide, and how to hire for potential versus proven experience.',
    example: 'A logistics company needs to hire its first operations director who will manage 12 employees, vendor relationships, and process improvement initiatives with minimal supervision.',
    category: 'manage',
    tierAccess: 'members',
    questionNumber: 16
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you evaluate whether a business is ready to scale its sales and marketing investment, and what is the correct sequence of activities to grow revenue without outpacing the operational capacity to deliver? Describe the key metrics that signal product-market fit is strong enough to justify aggressive growth investment, how to calculate the unit economics including customer acquisition cost and lifetime value that must hold for the growth math to work, and how to identify the operational constraints that will break first if volume doubles. Include how to build a growth plan that sequences marketing, sales, delivery capacity, and working capital investments in the right order, and how to set realistic growth targets that stretch the team without creating quality failures.',
    example: 'A B2B SaaS company with $800K ARR and 85% gross margins is considering raising $2M to hire a sales team but has never done outbound before and the product still has known gaps.',
    category: 'manage',
    tierAccess: 'pro',
    questionNumber: 17
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'When a business has succeeded in its core market and is considering geographic expansion, adding new product lines, or entering adjacent customer segments, how do you evaluate which growth path offers the best return on investment and strategic positioning? Walk through the framework for assessing growth options including market size and accessibility, competitive intensity, operational complexity and capital requirements, the degree to which existing capabilities transfer, and how each option affects the core business. Include how to design and run a low-cost experiment to test the expansion hypothesis before full commitment, what metrics tell you the expansion is working versus failing, and when to double down versus pivot to a different growth vector.',
    example: 'A profitable regional restaurant chain with 6 locations is evaluating opening locations in two new cities, launching a catering service line, and introducing a meal kit delivery product simultaneously.',
    category: 'manage',
    tierAccess: 'free',
    questionNumber: 18
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you build and manage a sales pipeline for a B2B business when your sales cycle is long, involves multiple decision makers, and requires significant customization of the solution? Describe how to define and qualify leads at each pipeline stage, assign probability weightings that allow for accurate revenue forecasting, manage the activities needed to move deals forward including relationship building, objection handling, proposal writing, and negotiation, and how to analyze pipeline health to identify coaching and process opportunities. Include how to set and track quota against pipeline coverage ratios, how to handle stalled deals without being annoying, and what CRM practices actually improve close rates versus what is just data entry theater.',
    example: 'An enterprise software company with a 6-month average sales cycle needs to forecast revenue with enough confidence to make hiring decisions for the implementation team.',
    category: 'manage',
    tierAccess: 'members',
    questionNumber: 19
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'What is the strategic and operational framework for entering a new market where established competitors have significant advantages in brand recognition, customer relationships, distribution, and pricing power? Describe how to identify a beachhead segment where your differentiation matters most and where the incumbents are weakest, how to design a go-to-market strategy that does not require you to win on budget, how to build enough reference customers and case studies to overcome the risk perception of buying from a new entrant, and how to use your initial wins to expand systematically into broader segments. Include how long it typically takes for market entry strategies to produce measurable traction, and how to adjust strategy when initial positioning is not resonating.',
    example: 'A new HR software company is trying to compete against established platforms with 10 years of market presence and much lower prices due to their scale, targeting mid-market companies with 100-500 employees.',
    category: 'manage',
    tierAccess: 'pro',
    questionNumber: 20
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How do you build and maintain the business relationships with vendors, suppliers, service providers, and strategic partners that are essential to operating effectively and getting favorable terms as a small or new business? Describe the process for identifying which external relationships are strategic versus transactional, how to approach and develop relationships with vendors who are much larger than you, how to negotiate terms including payment timing, volume commitments, and service levels when you lack leverage, and how to create mutual value so that partners prioritize your business when capacity is constrained. Include how to manage vendor concentration risk, what contract terms are non-negotiable versus negotiable, and how to handle a critical vendor relationship that is deteriorating.',
    example: 'A new food manufacturer depends on three primary ingredient suppliers and needs 60-day payment terms to manage cash flow but all three currently require payment upfront.',
    category: 'start',
    tierAccess: 'members',
    questionNumber: 21
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'When a business receives a large contract or purchase order that it does not currently have the working capital to fulfill, how do you evaluate and execute the financing options available to bridge the gap between when costs are incurred and when revenue is collected? Walk through the mechanics of purchase order financing, invoice factoring, revolving lines of credit, and merchant cash advances, including the true cost of each in annual percentage terms, the operational requirements they impose, and the business conditions under which each is appropriate. Include how to present the opportunity and your financials to a lender in a way that demonstrates creditworthiness, how to structure the repayment to align with your cash flow, and what mistakes cause businesses to get trapped in expensive short-term debt cycles.',
    example: 'A staffing company wins a $400K government contract starting in 30 days but must fund three months of payroll before the first invoice is due, and has only $45K in its bank account.',
    category: 'money',
    tierAccess: 'pro',
    questionNumber: 22
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you build a customer service operation that resolves issues efficiently, turns dissatisfied customers into loyal advocates, collects actionable feedback for product and process improvement, and does not create unsustainable costs as transaction volume grows? Describe the process for mapping the customer journey and identifying the highest-impact failure points, designing escalation paths and resolution authority for different issue types, building scripts and decision trees that produce consistent outcomes across different representatives, measuring both efficiency metrics and customer satisfaction, and using complaint patterns to drive upstream fixes in operations or product. Include how to handle customers who are unreasonable, how to decide when to issue refunds versus stand firm, and how to build a service culture in hourly employees.',
    example: 'A subscription e-commerce company with 5,000 active customers is receiving 200 support tickets per week and its 2-person service team is overwhelmed and response times have hit 4 days.',
    category: 'manage',
    tierAccess: 'pro',
    questionNumber: 23
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How do you build a financial model that accurately projects the revenue, costs, and cash flow of a new business venture when you are operating with highly uncertain inputs around customer acquisition rate, pricing, churn, and cost structure? Describe the architecture of a three-statement financial model including income statement, balance sheet, and cash flow statement, how to model different scenarios including base case, upside, and downside, what assumptions are most sensitive and require the most scrutiny, and how to stress-test the model against realistic worst-case situations. Include how to calibrate your model using industry benchmarks and comparable companies, what the model reveals about the minimum viable scale to reach profitability, and how investors evaluate the quality and credibility of financial projections.',
    example: 'A founder needs to present a 3-year financial model to potential investors for a subscription-based professional development platform targeting corporate clients, with no revenue history.',
    category: 'money',
    tierAccess: 'pro',
    questionNumber: 24
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you design an onboarding program for new employees that gets them to full productivity quickly, builds strong relationships with their team and the company culture, reduces early attrition, and sets clear expectations for performance? Walk through the specific activities, information, training, and check-ins that should happen in the first day, first week, first 30 days, and first 90 days for both individual contributors and managers. Include how to create onboarding materials that do not become immediately outdated, how to structure role-specific training versus company-wide orientation, how to use buddies or mentors effectively, and how to measure whether the onboarding is actually working. Describe the most common onboarding failures and what they cost the business in terms of ramp time, attrition, and team morale.',
    example: 'A professional services company that hires 2-3 new consultants per quarter currently has no formal onboarding program and new hires report feeling lost and unsupported for their first 60 days.',
    category: 'manage',
    tierAccess: 'members',
    questionNumber: 25
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How do you decide which business name, domain, and trademark are actually available and defensible before you commit to branding, signage, and marketing spend? Walk through the search process across state business registries, the USPTO trademark database, domain registrars, and social handles, and explain what level of conflict should stop you versus what is an acceptable risk.',
    example: 'A founder loves a name for a new bakery but a similarly named catering company already operates two counties over.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 76
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'What insurance coverage does a new business actually need in its first year, and how do you decide the right balance between protection and premium cost? Cover general liability, professional liability, property, workers compensation, and cyber coverage, and explain the questions you would ask an insurance broker before signing anything.',
    example: 'A one-person web design studio working from a home office is deciding whether professional liability insurance is worth the monthly premium.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 77
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How do you choose between renting commercial space, operating from home, or going fully remote for a new business, and what financial and operational tradeoffs does each option carry? Walk through lease terms, build-out costs, zoning restrictions, and how customer expectations in your industry affect the decision.',
    example: 'A personal trainer is deciding between renting a small studio, using a shared gym space, or training clients exclusively at their homes.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 78
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'What is the process for securing the permits and licenses specific to your trade before you can legally open, and how do you avoid the delays that catch new owners off guard? Describe how to find the right city, county, and state agencies, the typical timeline for approval, and what to do if an inspection fails.',
    example: 'A new food truck owner has the vehicle and menu ready but has not yet looked into health department permits or the commissary kitchen requirement.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 79
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How do you build a basic financial model before launch that tells you whether the business can realistically become profitable, including your break-even point and the runway you need to get there? Explain which assumptions matter most, how to stress-test them, and what result should make you pause before investing further.',
    example: 'A couple wants to open a small bookstore and needs to know how many books per day they must sell to cover rent and payroll.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 80
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'When two or more people start a business together, what should the founders agreement cover to prevent disputes later, including equity splits, vesting, decision rights, and what happens if someone wants to leave? Walk through the conversations that are uncomfortable but necessary before any money changes hands.',
    example: 'Two friends who have never run a business before are splitting ownership 50/50 on a new landscaping company with no written agreement yet.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 81
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How do you select the right point-of-sale, scheduling, or booking software for a new business when every vendor claims to be the best fit? Describe the criteria for evaluating cost, integrations, support quality, and switching cost down the road, and how to run a real trial before committing.',
    example: 'A new salon owner is comparing three booking platforms that each charge differently and integrate with different payment processors.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 82
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'What should a new business owner know about hiring their first employee versus using contractors, including the legal distinction, the tax and compliance obligations, and the operational commitment each path creates? Explain the warning signs that a business is misclassifying workers and what that risk actually costs.',
    example: 'A solo photographer books more weddings than they can shoot and is deciding whether to hire an assistant as an employee or a 1099 contractor.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 83
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How do you build an opening-week marketing plan on a limited budget that actually brings in the first wave of paying customers rather than just likes and views? Walk through the channels worth testing first, how to track what is working within days rather than months, and when to cut a channel that is not converting.',
    example: 'A new coffee shop has $1,500 for marketing before opening day and is unsure whether to spend it on local ads, flyers, or an opening event.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 84
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'What is the right way to set up business banking and separate personal and business finances from day one, and why does this matter for liability protection, taxes, and simply knowing if the business is profitable? Describe the accounts, cards, and habits to put in place before the first dollar comes in.',
    example: 'A new LLC owner has been using their personal checking account for the first two months of business transactions.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 85
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How do you evaluate whether to buy an existing business, buy a franchise, or start completely from scratch, and what due diligence does each path require before signing anything? Compare the capital required, the risk profile, and the speed to revenue for each option.',
    example: 'A former restaurant manager has savings to invest and is weighing a franchise sandwich shop against buying out a struggling independent diner.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 86
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'What should go into a one-page business plan that is actually useful for decision-making, as opposed to a long document written mainly to look impressive to outsiders? Walk through the sections that matter for a founder running the business day to day and how often it should be revisited.',
    example: 'A first-time founder has a 40-page business plan from a template but cannot answer what their plan is for the next 90 days.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 87
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How do you identify and vet your first suppliers or vendors when you have no track record to negotiate with and limited purchasing volume? Explain how to compare quality, reliability, and payment terms, and what red flags should make you walk away from a supplier relationship early.',
    example: 'A new candle maker is choosing between three wax and fragrance suppliers with very different minimum order quantities and lead times.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 88
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'What is the right amount of personal savings or runway to have in place before quitting a day job to run a new business full time, and how do you calculate it honestly? Walk through how to account for both business expenses and personal living costs during the ramp-up period.',
    example: 'An employee with a stable salary wants to quit in three months to run their side business full time but has not calculated their true monthly burn rate.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 89
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How should a new business set its hours of operation, and what tradeoffs exist between maximizing availability for customers and protecting the owner from burnout in the first year? Describe how to test hours against real demand data rather than guessing.',
    example: 'A new bakery is debating whether to open seven days a week from the start or launch with five days and expand based on demand.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 90
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'What is the process for building a simple customer feedback loop in the first 90 days so that early problems get caught before they become patterns that damage the reputation of the business? Explain what questions to ask, how often, and how to act on what you learn without overreacting to a single complaint.',
    example: 'A new cleaning service has completed 40 jobs but has no structured way of knowing if customers are satisfied beyond repeat bookings.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 91
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How do you decide on your initial product or service lineup when offering too much creates operational complexity but offering too little limits revenue? Walk through how to choose a focused starting menu or service list and the signals that tell you when it is time to expand it.',
    example: 'A new food truck has twelve menu items planned but the owner has never run a commercial kitchen before.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 92
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'What should a new business owner understand about sales tax collection and remittance across the jurisdictions where they sell, especially if they sell online as well as in person? Explain how to determine nexus, register correctly, and avoid the penalties that come from getting this wrong in the first year.',
    example: 'A new online store based in one state is starting to ship products to customers in several other states.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 93
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'How do you build the first version of your brand identity, including logo, colors, and voice, without spending more than a new business can afford on design? Explain how to brief a designer effectively, what to test with real customers, and when a DIY approach is good enough versus when it hurts credibility.',
    example: 'A new consulting firm has a logo made in an hour using a free tool and is unsure if it undermines their pitch to larger clients.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 94
  },
  {
    businessTitle: 'Starting Your Business',
    questionText: 'What is a realistic timeline from the decision to start a business to actually opening the doors or launching the website, and what are the steps most new owners underestimate? Walk through a sample 90-day launch plan including the dependencies that can stall progress if not sequenced correctly.',
    example: 'A first-time founder wants to launch a new service business in six weeks but has not yet registered the business entity or opened a bank account.',
    category: 'start',
    tierAccess: 'bonus',
    questionNumber: 95
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you design a standard operating procedure document for a recurring task so that any trained employee can perform it consistently, even if the person who normally does it is out? Describe the format, level of detail, and review cadence that keeps procedures useful instead of outdated and ignored.',
    example: 'A restaurant has one cook who closes the kitchen a specific way every night, but no one else knows the full checklist.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 96
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'What inventory management system should a small business use to avoid both stockouts that lose sales and overstock that ties up cash, and how do you set reorder points for each product? Walk through how to calculate lead time, safety stock, and how often counts should happen.',
    example: 'A boutique retailer frequently runs out of their best-selling item while sitting on excess inventory of slower movers.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 97
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you set up a customer complaint handling process that resolves issues quickly, protects the relationship, and feeds lessons back into how the business operates? Describe how to triage complaints by severity, who should be empowered to resolve them, and how to track recurring issues over time.',
    example: 'A home repair company receives occasional complaints about missed appointment windows but has no consistent way of tracking or resolving them.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 98
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'What is the right approach to scheduling staff shifts so that labor costs match demand without leaving the business understaffed during peak hours? Walk through how to forecast demand by day and hour, build a schedule around it, and handle last-minute call-outs.',
    example: 'A cafe is overstaffed on slow weekday mornings and understaffed during the weekend rush, driving both wasted payroll and lost sales.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 99
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you choose which parts of the business to automate first when budget for new software or equipment is limited? Explain how to calculate the time and error cost of a manual process versus the cost and setup time of automating it, and how to sequence automation investments.',
    example: 'A small accounting firm manually enters data from client documents and is deciding whether to invest in document automation software.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 100
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'What vendor management process keeps a business from being overly dependent on a single supplier, and how do you build backup options without doubling your costs? Walk through how to evaluate supplier risk, negotiate terms that protect you, and when it makes sense to qualify a second source.',
    example: 'A manufacturer sources a key component from a single overseas supplier and had a two-week delay last year that stalled production.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 101
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you build a quality control process for a service business where the output is intangible, as opposed to a product business where defects are easier to spot? Describe what to measure, how to audit without micromanaging staff, and how to course-correct when quality slips.',
    example: 'A marketing agency has noticed inconsistent quality across client deliverables depending on which account manager handles the work.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 102
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'What is the right way to handle a major equipment failure or supply disruption that threatens to stop operations for days, and what contingency plans should be in place before it happens? Walk through the decisions to make in the first 24 hours and how to communicate with affected customers.',
    example: 'A laundromat\u2019s main commercial washer breaks down with no backup machine and a two-week part delivery wait.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 103
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you decide which business functions to keep in-house versus outsource, such as bookkeeping, IT support, or customer service? Explain the cost, quality, and control tradeoffs of each option and how to structure an outsourcing relationship so accountability does not get lost.',
    example: 'A ten-person company is deciding whether to hire an in-house bookkeeper or continue outsourcing to a part-time contractor.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 104
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'What data should a small business track daily, weekly, and monthly to actually run operations well, as opposed to vanity metrics that look good but do not drive decisions? Walk through how to build a simple dashboard and the one or two numbers that would trigger an immediate response if they moved.',
    example: 'A gym tracks total membership count but has no visibility into daily check-ins, class attendance, or cancellation trends.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 105
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you build a disaster recovery plan for a business that depends heavily on a physical location, covering scenarios like fire, flood, extended power outage, or a break-in? Describe what should be documented in advance, what insurance should cover, and how operations continue during the recovery period.',
    example: 'A small bakery has never documented what to do if a fire or flood damaged the kitchen and forced a temporary closure.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 106
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'What is the right process for evaluating and switching core business software, such as accounting or scheduling systems, without disrupting daily operations during the transition? Walk through how to plan data migration, staff retraining, and a cutover date that minimizes risk.',
    example: 'A company has outgrown its spreadsheet-based scheduling system but is worried about the disruption of switching mid-season.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 107
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you set and enforce quality standards for recurring deliverables when the team doing the work has turnover and varying skill levels? Describe how to build checklists, training, and review steps that keep output consistent even as the people performing the work change.',
    example: 'A cleaning company has had five different crew members in six months, and the quality customers receive varies noticeably by who shows up.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 108
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'What is the best approach to managing multiple locations or service areas once a business expands beyond a single site, including how to maintain consistent quality and communication across them? Walk through what should be centralized versus what should be delegated to local managers.',
    example: 'A pet grooming business that operated from one location for three years just opened a second location across town.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 109
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you build a process for handling returns, refunds, or service redos that is fair to customers without being exploited or creating a financial drain? Describe the policy you would write, how staff should apply it consistently, and how to track abuse patterns.',
    example: 'An online store has seen a rise in return requests and is unsure whether its current no-questions-asked policy is too generous.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 110
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'What is the right way to manage seasonal demand swings in a business where revenue is heavily concentrated in a few months of the year? Walk through staffing, cash flow, and inventory strategies that get the business through the slow season without crisis.',
    example: 'A landscaping company earns 70% of its annual revenue between April and September and struggles every winter.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 111
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you set up a basic cybersecurity practice for a small business that handles customer data and payments, without the budget for a dedicated IT security team? Describe the minimum practices around passwords, backups, software updates, and staff training that meaningfully reduce risk.',
    example: 'A small medical billing company stores sensitive client data on a shared office computer with no formal security policy.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 112
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'What is the process for renegotiating a lease or vendor contract that no longer serves the business as terms or circumstances change? Walk through how to prepare, what leverage you actually have, and when it makes more sense to relocate or switch vendors instead of renegotiating.',
    example: 'A retail store\u2019s lease is up for renewal and rent is being raised 25% in a location with declining foot traffic.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 113
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'How do you handle a situation where a long-time vendor or supplier suddenly raises prices significantly, and what options exist beyond simply absorbing the cost or passing it to customers? Walk through negotiation tactics, alternative sourcing, and how to communicate a price change to customers if needed.',
    example: 'A bakery\u2019s main flour supplier just raised prices 18% with only two weeks notice before the next delivery.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 114
  },
  {
    businessTitle: 'Managing Operations',
    questionText: 'What is the right way to document institutional knowledge that currently exists only in the owner\u2019s head, so the business can function and be evaluated or sold without the owner present? Describe the process for capturing processes, vendor relationships, and client history systematically.',
    example: 'A business owner realizes that if they were out for a month, almost no one else could answer a basic vendor or client question.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 115
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How do you set up a simple weekly cash flow forecast that tells you whether the business can meet payroll and major bills over the next 60 days? Walk through what inputs are needed, how often it should be updated, and what variance should trigger action.',
    example: 'A business has enough cash today but has not projected whether a large vendor payment and payroll will overlap badly next month.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 116
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'What is the right way to price a service when customers have wildly different needs, and how do you decide between flat pricing, tiered packages, and fully custom quotes? Walk through how each pricing model affects sales conversations, margin, and the scalability of the business.',
    example: 'A web design freelancer is quoting every project individually and finds each proposal takes hours to prepare.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 117
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How do you calculate the true profitability of each product or service line when shared costs like rent and admin staff are hard to allocate cleanly? Walk through a method for allocating overhead and the decisions that change once you see real line-level margins.',
    example: 'A cafe sells coffee, pastries, and catering but has never calculated which category actually drives profit versus just revenue.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 118
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'What should a business do when a major customer consistently pays late, and how do you balance maintaining the relationship against protecting your own cash flow? Walk through the collections process, what contract terms would prevent this, and when to require upfront deposits going forward.',
    example: 'A contractor\u2019s largest client regularly pays invoices 45 days late despite 15-day terms in the contract.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 119
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How do you decide whether to lease or buy major equipment for the business, accounting for cash flow impact, tax treatment, maintenance responsibility, and how quickly the equipment becomes outdated? Walk through the full cost comparison over the expected useful life.',
    example: 'A print shop needs a new large-format printer costing $40,000 and is comparing a lease against financing a purchase.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 120
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'What retirement and benefits structure makes sense for a small business owner and their employees, balancing the cost to the business against the need to attract and retain good people? Walk through the options available at different company sizes and budgets.',
    example: 'A ten-person company has never offered retirement benefits and is losing candidates to larger competitors that do.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 121
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How do you build a reserve fund policy that specifies how much cash to keep on hand, where to keep it, and under what conditions it can be spent, so the decision is not made emotionally during a crisis? Walk through how to size the reserve based on the business\u2019s actual expense volatility.',
    example: 'A seasonal business has cash sitting in a regular checking account with no policy on how much to keep versus reinvest.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 122
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'What is the process for preparing financial statements that a bank or investor will actually trust, and what common mistakes cause small business financials to get rejected in a lending decision? Walk through what level of bookkeeping rigor is needed before approaching outside capital.',
    example: 'A business owner has only ever used a single spreadsheet for bookkeeping and now needs to apply for an SBA loan.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 123
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How do you decide when it is time to hire a part-time or full-time bookkeeper or accountant instead of handling the books yourself, and what should that role be responsible for versus what a tax preparer handles separately? Walk through the signs that DIY bookkeeping is costing more than it saves.',
    example: 'A growing business owner spends six hours every week on bookkeeping and is behind on reconciling the last two months.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 124
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'What is the right approach to managing foreign currency risk for a business that buys from or sells to international suppliers or customers? Walk through how exchange rate movement affects margins and what tools exist to hedge against it at a small business scale.',
    example: 'A furniture importer pays suppliers in a foreign currency that has moved 12% against the dollar in the last year.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 125
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How do you structure owner compensation in the early years of a business when cash is tight, balancing paying yourself fairly against reinvesting in growth? Walk through how to decide between a fixed salary, a percentage draw, or deferred compensation.',
    example: 'A founder has not paid themselves consistently in 18 months and is unsure how to start without destabilizing cash flow.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 126
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'What is the right process for evaluating a business loan offer, including comparing interest rate, fees, repayment terms, and any personal guarantee required? Walk through the questions to ask a lender and the red flags in a loan agreement that should give a borrower pause.',
    example: 'A business has been offered a merchant cash advance with daily repayments that seem faster than their typical loan options.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 127
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How do you calculate customer acquisition cost and customer lifetime value for a small business, and what should those two numbers tell you about how much to spend on marketing? Walk through the data needed and how to act once you know whether the ratio is healthy.',
    example: 'A subscription box company spends on ads but has never calculated what each customer actually costs to acquire versus what they are worth over time.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 128
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'What tax planning should a profitable small business do before year-end to legally minimize their tax bill, including entity structure, retirement contributions, equipment purchases, and timing of income and expenses? Walk through the conversation to have with a tax professional in the fourth quarter.',
    example: 'A business is having its most profitable year yet and the owner has not spoken to their accountant since filing last year\u2019s taxes.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 129
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How do you decide the right level of accounts receivable terms to offer business customers, balancing competitiveness in winning their business against the cash flow strain of waiting to get paid? Walk through how to set terms by customer risk and how to enforce them consistently.',
    example: 'A wholesale supplier offers the same 30-day terms to every customer regardless of order size or payment history.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 130
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'What is the right way to evaluate whether a discount or promotion actually drives profitable incremental business versus just giving away margin to customers who would have purchased anyway? Walk through how to structure a test and measure the real impact before rolling out a promotion broadly.',
    example: 'A retailer runs a 20% off sale every month and has never measured whether it increases total profit or just shifts the timing of existing sales.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 131
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How do you build a capital expenditure plan for the next three years that sequences major purchases like equipment, vehicles, or renovations against expected cash flow? Walk through how to prioritize which investments to make first and how to decide between financing and paying cash.',
    example: 'A growing landscaping company needs two new trucks, a storage building, and new mowing equipment but cannot afford all three this year.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 132
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'What is the right process for valuing a small business, whether for a potential sale, bringing in a partner, or an ownership buyout, and which valuation method applies best to a business with modest revenue? Walk through how earnings multiples, asset value, and goodwill factor into the number.',
    example: 'Two co-owners are negotiating a buyout where one wants to leave and cash out their share of a profitable service business.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 133
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'How should a business decide between reinvesting profit into growth versus distributing it to owners, especially when growth opportunities exist but carry real execution risk? Walk through the framework for evaluating expected return on a growth investment against the certainty of a distribution.',
    example: 'A profitable consulting firm has $150,000 in retained earnings and is debating whether to open a second office or distribute the profit to the two partners.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 134
  },
  {
    businessTitle: 'Business Finances',
    questionText: 'What is the right approach to managing credit card and merchant processing fees, which can quietly erode margin on every single transaction? Walk through how to compare processors, when surcharging or minimum purchase amounts are appropriate, and how to negotiate rates as volume grows.',
    example: 'A retail shop has never renegotiated its credit card processing rate since opening five years ago despite significant growth in transaction volume.',
    category: 'money',
    tierAccess: 'bonus',
    questionNumber: 135
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you write a job posting and structure an interview process that actually predicts whether a candidate will succeed in the role, rather than just who interviews well? Walk through the specific questions, work samples, or trial tasks that reveal real ability.',
    example: 'A business has hired three customer service reps in a row who interviewed well but struggled once on the job.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 136
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'What is the right compensation structure for a sales role, balancing base salary, commission, and bonus so that incentives align with what the business actually needs, such as margin or long-term customer relationships rather than just volume? Walk through how to design and test a plan.',
    example: 'A company\u2019s current commission-only sales structure is driving reps to discount heavily to close deals faster.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 137
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you handle a situation where a long-tenured, otherwise valuable employee is consistently underperforming in one specific area? Walk through the documentation, coaching conversations, and timeline you would follow before deciding whether a performance improvement plan or termination is appropriate.',
    example: 'A five-year employee is excellent with customers but has repeatedly missed deadlines on administrative paperwork despite several verbal reminders.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 138
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'What is the right process for setting and communicating performance expectations so that employees know exactly what success looks like in their role? Walk through how to build simple, measurable goals and a review cadence that catches problems early rather than only at an annual review.',
    example: 'A team of six has never had individual performance goals and reviews happen inconsistently, if at all.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 139
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you build a promotion and career path structure for a small business where there are only a few levels above entry roles, so good employees do not leave simply because they see no room to grow? Walk through options beyond a traditional title promotion.',
    example: 'A strong employee has told their manager they are considering another job mainly because they feel stuck with no path forward.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 140
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'What should an employee handbook actually include for a small business, and how do you keep it legally sound without it becoming a document no one reads or follows? Walk through the policies that matter most and how to roll out updates when laws or practices change.',
    example: 'A ten-employee business has never had a written handbook and is unsure what policies are legally required versus optional.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 141
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you handle a conflict between two employees that is starting to affect team morale and productivity, without taking sides unfairly or ignoring a real problem? Walk through the mediation process and when the conflict requires a formal response versus informal coaching.',
    example: 'Two senior staff members have an ongoing personal disagreement that is now affecting how the rest of the team communicates.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 142
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'What is the right approach to building a culture of accountability where employees take ownership of mistakes without being afraid to report problems early? Walk through how leadership behavior, incentive structure, and response to mistakes either build or destroy this kind of culture.',
    example: 'A manager has noticed employees hiding small mistakes rather than reporting them, leading to bigger problems downstream.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 143
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you decide when a team has grown large enough to need a middle manager layer, and how do you select and train the first person to move into that role from within the team? Walk through the risks of promoting the wrong person and how to structure support for the new manager.',
    example: 'A business has grown from 4 to 14 employees reporting directly to the owner, who no longer has time for one-on-ones with everyone.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 144
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'What is the right exit process when an employee resigns or is let go, covering knowledge transfer, client communication, access revocation, and final pay, so the transition does not damage operations or relationships? Walk through a checklist that covers both voluntary and involuntary departures.',
    example: 'A key account manager just gave two weeks notice and holds relationships with several of the company\u2019s largest clients.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 145
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you build a fair and sustainable overtime and scheduling policy for hourly employees that complies with labor law while still meeting the operational needs of the business? Walk through how to track hours accurately and handle disputes over pay.',
    example: 'A restaurant has had several disputes with staff over whether certain shift changes should count toward overtime.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 146
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'What is the right way to recognize and reward strong performance in a small business without a large budget for bonuses or raises? Walk through non-monetary and low-cost recognition strategies and how to make sure recognition feels genuine rather than token.',
    example: 'A business owner wants to retain their best employee but cannot currently afford a meaningful raise.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 147
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you handle employee requests for remote or hybrid work arrangements in a business where the role has traditionally been performed in person? Walk through how to evaluate which roles can flex, how to set expectations, and how to keep the policy fair across the team.',
    example: 'An administrative employee has asked to work from home two days a week after a strong first year of in-office performance.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 148
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'What should a business do when it receives a complaint about harassment or discrimination, and what process ensures the investigation is fair, thorough, and legally compliant? Walk through the immediate steps to take and how to communicate with the parties involved during the investigation.',
    example: 'An employee has filed a complaint about a coworker\u2019s comments, and the owner has never handled a formal complaint before.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 149
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you design a training program for a skill-based role where quality directly affects customer satisfaction, and how do you verify that training actually transferred into consistent on-the-job performance? Walk through how to measure skill retention over time.',
    example: 'A spa has had inconsistent client satisfaction scores for a service that depends heavily on technician skill and training quality.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 150
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'What is the right way to manage a multigenerational workforce where employees have very different expectations around communication, feedback, and flexibility? Walk through how to build policies and a management style that work across those differences without favoring one group.',
    example: 'A business with employees ranging from 19 to 62 years old has noticed friction over communication preferences and scheduling expectations.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 151
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you structure a probationary or introductory period for new hires that genuinely allows you to evaluate fit, while still being fair and legally sound? Walk through what should be evaluated during this period and how to handle the decision if it is not working out.',
    example: 'A new hire is struggling in their first month, and the manager is unsure whether to extend support or end the employment relationship.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 152
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'What should a business consider before implementing employee monitoring tools, such as time tracking or activity software, to balance accountability against trust and morale? Walk through how to introduce monitoring transparently and what level is appropriate for different roles.',
    example: 'A remote team\u2019s manager is considering screen-monitoring software after noticing inconsistent output from a few employees.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 153
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'How do you build a succession plan for key roles in a small business so that the departure of one critical person, whether planned or sudden, does not put operations at serious risk? Walk through how to identify key-person risk and start cross-training before it becomes urgent.',
    example: 'A business\u2019s entire client relationship history lives with one long-time employee who has not taken a vacation in two years.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 154
  },
  {
    businessTitle: 'Employee Management',
    questionText: 'What is the right way to handle a request from an employee for a significant raise outside the normal review cycle, especially if they have a competing job offer? Walk through how to evaluate the request fairly and the broader pay equity implications of saying yes or no.',
    example: 'A valued employee has come to their manager with a competing offer 20% higher than their current pay and wants a decision within a week.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 155
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you decide when the business is actually ready to expand into a second location or market, as opposed to expanding too early based on excitement rather than evidence? Walk through the operational and financial signals that indicate real readiness.',
    example: 'A single-location restaurant has had six consecutive months of record sales and the owner is eager to open a second location.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 156
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'What is the process for evaluating a new product or service line extension to make sure it fits with the existing brand and operational capability rather than diluting focus? Walk through how to test demand before committing significant resources to the new offering.',
    example: 'A skincare brand known for facial products is considering launching a body care line without testing demand first.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 157
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you build a referral or partnership program with complementary businesses that genuinely drives new customers rather than just creating goodwill with no measurable return? Walk through how to structure incentives and track which partnerships actually convert.',
    example: 'A wedding photographer wants to build referral relationships with local venues and planners but has no system to track which ones send real business.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 158
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'What is the right approach to raising outside capital for growth, whether from friends and family, angel investors, or a small venture fund, and how do you decide how much to raise and what to give up? Walk through what terms matter most beyond the valuation number.',
    example: 'A founder has an opportunity to raise $250,000 from a local investor group but has never negotiated an investment term sheet before.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 159
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you decide whether to pursue growth through organic customer acquisition, paid advertising, or acquiring a competitor, and what does each path require in terms of capital, risk, and management attention? Walk through the comparison framework for a business deciding its next growth lever.',
    example: 'A regional service company is deciding between ramping up digital advertising spend or acquiring a smaller competitor in a neighboring market.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 160
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'What is the process for entering a new geographic market when local regulations, competitive landscape, and customer expectations may differ significantly from your home market? Walk through the research and pilot approach you would take before fully committing.',
    example: 'A home services company that has operated in one metro area for five years is considering expanding into a neighboring state.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 161
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you decide when to transition from a founder-led sales process to building a dedicated sales team, and how do you avoid a drop in close rates during that transition? Walk through how to document and transfer the founder\u2019s sales approach to new hires.',
    example: 'A founder personally closes every deal and the business cannot grow past a certain revenue ceiling without changing that.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 162
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'What is the right way to evaluate a strategic partnership or joint venture opportunity, including how to structure the agreement so both parties are genuinely incentivized toward the same outcome? Walk through the warning signs that a partnership will create more friction than value.',
    example: 'Two complementary businesses are discussing a joint venture to co-market a bundled service but have not discussed how revenue would be split.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 163
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you build a customer retention strategy that reduces churn as the business scales and the owner can no longer maintain a personal relationship with every customer? Walk through what systems and triggers take over for the owner\u2019s personal touch.',
    example: 'A subscription service has grown from 50 to 2,000 customers and retention has started dropping now that the owner cannot call every customer personally.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 164
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'What is the right approach to building a brand that can scale beyond the founder\u2019s personal reputation, especially in a business where the founder has been the face of the company? Walk through how to transfer trust from the founder to the broader organization.',
    example: 'A consulting business built entirely around the founder\u2019s personal brand is struggling to bring on associate consultants that clients trust equally.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 165
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you decide the right pace of hiring ahead of expected growth, balancing the risk of being understaffed when demand arrives against the cost of carrying payroll before revenue catches up? Walk through how to build a hiring plan tied to specific growth triggers.',
    example: 'A business has landed a large new contract starting in 60 days and needs to decide how far ahead to start hiring and training.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 166
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'What is the process for building a franchise or licensing model if a business wants to grow using other people\u2019s capital rather than its own? Walk through what needs to be standardized and documented before a business is actually franchisable.',
    example: 'A successful three-location business keeps getting asked by customers if they offer franchises but has never formally explored it.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 167
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you evaluate whether an acquisition offer for your business is fair, and what should you negotiate beyond the headline purchase price, including earnouts, employee retention, and your own role post-sale? Walk through the due diligence you should do on the buyer as well.',
    example: 'A founder has received an acquisition offer from a larger competitor that includes a two-year earnout tied to performance targets.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 168
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'What is the right way to build a content or thought leadership strategy that attracts customers over time without requiring a large ongoing budget? Walk through how to choose a format and topic focus that compounds in value and how to measure whether it is actually driving business results.',
    example: 'A B2B service firm wants to build credibility through content but is unsure whether to focus on a blog, video, or a newsletter.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 169
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you decide whether international expansion makes sense for a business, and what operational, legal, and cultural factors most often derail businesses that expand too quickly across borders? Walk through a staged approach to testing a new country market.',
    example: 'An e-commerce brand with strong domestic sales is considering fulfilling orders internationally for the first time.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 170
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'What is the right approach to building a competitive moat so that growth is not easily copied by competitors who see your success and enter the same market? Walk through which types of advantages are durable versus which are easily replicated.',
    example: 'A business has grown quickly in a niche market and is already seeing new competitors copy their pricing and marketing approach.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 171
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you decide when it is time to bring in outside executives or a board of advisors as a business scales beyond what the founding team can manage alone? Walk through what to look for in an advisor, how much equity or compensation is appropriate, and how to actually use their input.',
    example: 'A fast-growing company\u2019s founders have never run a business this large before and are making strategic decisions without outside input.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 172
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'What is the process for building a long-term strategic plan that goes beyond the next 12 months, including how to set three to five year goals that are ambitious but still grounded in the business\u2019s actual capacity to execute? Walk through how often the plan should be revisited.',
    example: 'A business has only ever planned one year at a time and the owner wants to think further ahead but is not sure how.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 173
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'How do you evaluate the risk of growing too fast, including the operational strain, quality decline, and cash flow stress that rapid growth can cause even when demand is strong? Walk through the warning signs that growth needs to be deliberately slowed.',
    example: 'A business tripled its customer base in six months and is now seeing quality complaints and employee burnout rise sharply.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 174
  },
  {
    businessTitle: 'Business Growth',
    questionText: 'What is the right exit strategy to plan toward from the early days of a business, whether that is a sale, a family succession, an employee ownership transition, or running it indefinitely, and how does that choice shape decisions made years in advance? Walk through how to build optionality into the business regardless of which path is eventually chosen.',
    example: 'A founder in their 40s has not decided whether they eventually want to sell the business, pass it to their children, or run it until retirement.',
    category: 'manage',
    tierAccess: 'bonus',
    questionNumber: 175
  }
];

async function seedContent() {
    for (const business of businesses) {
      await Business.updateOne({ title: business.title }, { $setOnInsert: business }, { upsert: true });
    }

    for (const question of questions) {
      await Question.updateOne({ questionNumber: question.questionNumber }, { $setOnInsert: question }, { upsert: true });
    }
    const freeGrowthQuestion = questions.find((question) => question.businessTitle === 'Business Growth' && question.tierAccess === 'free');
    if (freeGrowthQuestion) {
      await Question.updateOne(
        { businessTitle: freeGrowthQuestion.businessTitle, questionNumber: freeGrowthQuestion.questionNumber },
        { $set: { tierAccess: 'free' } }
      );
    }
    console.log(`Ensured ${businesses.length} businesses and ${questions.length} questions`);
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/knoukno');
    await seedContent();

    await mongoose.disconnect();
    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

if (require.main === module) seed();

module.exports = { seedContent };
