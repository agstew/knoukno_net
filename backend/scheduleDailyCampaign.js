// One-time script: schedules a 2-year daily email campaign (730 emails, one per day at 10:00 UTC)
// rotating through 30 templates across 5 topics: Law, Shop, Hired, Customer, Saving.
// Reuses the existing ScheduledEmail model + processDueScheduledEmails() runner already in production.
require('dotenv').config();
const mongoose = require('mongoose');
const ScheduledEmail = require('./models/ScheduledEmail');

const templates = [
  // Law
  { topic: 'Law', subject: 'Is your business actually legal yet?', message: `Before the first sale ever happens, a business has to be real on paper, not just real in your head. That starts with choosing an entity type - sole proprietorship, partnership, LLC, S-Corp, or C-Corp - and each one changes how you are taxed, how exposed your personal assets are if something goes wrong, and how much paperwork you carry every year.

A sole proprietorship is the simplest to set up, but it offers no separation between you and the business. If the business is sued or owes money, your personal house, car, and savings can be on the line. An LLC creates a legal wall between you and the business in most situations, and it is often the first real upgrade a founder makes. As revenue grows, some businesses convert to an S-Corp for tax advantages on self-employment income, and larger, investor-backed companies often choose a C-Corp structure to make fundraising and equity easier to manage.

Once the entity is chosen, it needs to be registered with the state, which usually means filing articles of organization or incorporation, paying a filing fee, and naming a registered agent who can accept legal documents on behalf of the business. From there, you need an Employer Identification Number from the IRS, which acts like a social security number for the business and is required to open a business bank account, hire employees, and file taxes correctly.

Many new owners skip or delay this step because it feels like paperwork standing between them and actually running the business. But every day you operate without the right entity in place is a day your personal assets are exposed to the business's risk, and it is a day your bookkeeping gets more tangled between personal and business transactions. The fix almost always gets harder the longer you wait, not easier, because by then there may be existing contracts, vendor relationships, and tax filings that all need to be reconciled against the new structure.

It is also worth thinking ahead, not just about today. If you expect to bring on a partner, raise outside money, or eventually sell the business, the entity type you choose now will shape how smoothly those future events go. An LLC can be converted later, but it takes legal and accounting work, and it is far simpler to choose correctly the first time with your long-term plans in mind, even if those plans are still loose.

Treating legal groundwork as a one-time task rather than an ongoing responsibility is one of the most common mistakes new owners make. Requirements change as you add employees, add locations, or add new products and services, and a license or structure that was sufficient at launch may no longer cover what the business has become a year or two later. Building a simple annual habit of revisiting your legal and tax setup, even briefly, catches these gaps before they become expensive problems rather than after.

Today's question: what is the one legal step - choosing your entity, registering it, or getting your tax ID - that you have been putting off, and what is actually stopping you from doing it this week? Write down the real reason, whether it is cost, confusion, or simply not knowing where to start, because naming the obstacle honestly is usually the first step to clearing it.

We ask the questions. You write the answers, and we keep every one of them so you can come back to this decision later and see exactly what you were thinking and why.` },
  { topic: 'Law', subject: 'The license you forgot to check', message: `Every trade carries its own invisible checklist of permits and licenses, and most new owners only discover the ones they missed when an inspector, a landlord, or a customer complaint brings it to their attention. Health permits, signage permits, zoning approval, professional licenses, and local business licenses can all apply depending on what you sell, where you sell it, and how you operate.

Zoning is one of the most overlooked. A location can look perfect - good foot traffic, fair rent, close to your target customer - and still be zoned in a way that does not allow your specific type of business, or that limits your hours, your signage, or your ability to serve food or alcohol. Checking zoning before you sign a lease, not after, can save you from a very expensive mistake.

If your business touches food, health, or personal care, you are almost certainly looking at health department permits, and sometimes additional certifications for specific equipment or practices. These usually require an inspection before you can legally open, and scheduling that inspection can take weeks, which means the clock needs to start long before your planned opening day, not the week before.

Professional licensing is its own category. Contractors, cosmetologists, accountants, real estate agents, and dozens of other trades require a state-issued license to legally operate, and operating without one is not just a technicality - it can mean fines, forced closure, or being unable to collect payment for work already performed. If you are hiring people in a licensed trade, you also need to confirm their individual licenses are current, not just your own.

Then there is the local business license itself, which many cities and counties require simply to operate within their jurisdiction, separate from any state-level registration. This is often a small fee and a short form, but missing it is one of the most common reasons a new business gets an unexpected visit or notice in its first few months.

The practical approach is to build a simple checklist specific to your trade and location: call your city clerk's office, your county, and your state licensing board, and ask directly what applies to a business like yours. Do not assume that because a business down the street looks similar, the same rules apply - size, service offerings, and even the exact address can change what is required.

Treating legal groundwork as a one-time task rather than an ongoing responsibility is one of the most common mistakes new owners make. Requirements change as you add employees, add locations, or add new products and services, and a license or structure that was sufficient at launch may no longer cover what the business has become a year or two later. Building a simple annual habit of revisiting your legal and tax setup, even briefly, catches these gaps before they become expensive problems rather than after.

Today's question: have you personally confirmed, with the actual city, county, and state offices, every license and permit your specific trade requires, or are you relying on an assumption that you are covered? If you have not made those calls yet, today is a good day to start the list, even if you cannot finish it in one sitting.

We ask the questions. You write the answers, and we keep every one of them so this list is never lost in a drawer or a memory, but saved exactly where you can find it again.` },
  { topic: 'Law', subject: 'Taxes do not wait for you to feel ready', message: `Taxes are one of the few parts of running a business that do not pause while you figure things out. The clock starts the moment you make your first sale, and the obligations pile up quietly in the background whether or not you are tracking them, which is exactly why so many new owners are surprised by a tax bill they did not see coming.

The first real step is separating business and personal finances completely. This means a dedicated business bank account, a business credit card if you use one, and a firm rule that no personal expenses run through business accounts and no business expenses run through personal ones. Mixing the two does not just create a bookkeeping headache - it can also compromise the legal protection your entity is supposed to give you.

From there, you need to understand which taxes actually apply to your business. Most businesses owe federal income tax and self-employment tax if they are not structured as an S-Corp or C-Corp, along with state income tax in most states. If you sell physical goods, you likely owe sales tax, and if you sell across state lines, you may owe it in more than one state depending on where you have established nexus. If you have employees, payroll taxes become a whole additional category, with specific deadlines that are enforced strictly.

Many new owners are also surprised by estimated quarterly tax payments. Unlike a traditional paycheck where taxes are withheld automatically, business income usually requires you to estimate and pay taxes four times a year. Missing these payments, or underestimating them significantly, can result in penalties even if you pay everything owed by the annual deadline.

The good news is that a simple system prevents almost all of this stress. Setting aside a percentage of every dollar of revenue - often somewhere between twenty and thirty percent depending on your structure and local rates - into a separate savings account as soon as it comes in means the money is already there when a tax payment is due. Reconciling your books monthly, rather than scrambling once a year, means you catch mistakes while they are small and recent, not buried under twelve months of transactions.

It is also worth building a relationship with a tax professional before you need one urgently. A good accountant does more than file your return - they can tell you which deductions you are missing, whether your entity structure is still the right one as you grow, and what decisions this quarter will affect your tax bill next year.

Treating legal groundwork as a one-time task rather than an ongoing responsibility is one of the most common mistakes new owners make. Requirements change as you add employees, add locations, or add new products and services, and a license or structure that was sufficient at launch may no longer cover what the business has become a year or two later. Building a simple annual habit of revisiting your legal and tax setup, even briefly, catches these gaps before they become expensive problems rather than after.

Today's question: do you know exactly which taxes your business owes, when each one is due, and whether you have money set aside to cover them right now? If the honest answer is no, pick one tax obligation today and find out the real number and the real date.

We ask the questions. You write the answers, and we keep every one of them so you have a running record of exactly where your tax planning stands.` },
  { topic: 'Law', subject: 'Who owns what, in writing', message: `A handshake feels like enough when you are excited about a new business with a partner, a friend, or a family member. It rarely stays that way once real money, real decisions, and real disagreements enter the picture. The businesses that survive a falling out between owners are almost always the ones that wrote the hard conversations down before they needed them.

A founders agreement should cover far more than just the percentage split of ownership. It should address what happens if one founder wants to leave, voluntarily or otherwise. It should cover vesting - meaning ownership is earned over time rather than granted all at once, which protects the business if someone leaves early. It should specify who has final say on which types of decisions, because equal ownership does not always mean equal authority should exist on every choice.

Without this in writing, disputes get resolved by whoever is loudest, whoever threatens to walk away, or eventually, by a lawyer and a judge. None of those outcomes tend to preserve the relationship or the business. A clear agreement, even an imperfect one, gives you a reference point to return to instead of relitigating the same argument from scratch every time tension rises.

It is also worth thinking about what happens to ownership if a founder dies, becomes unable to work, divorces, or declares personal bankruptcy. These are uncomfortable scenarios to plan for, but a business with no plan for them can end up legally entangled with an ex-spouse, an estate, or a creditor who has no relationship to the business and no interest in its success.

If you have brought on an investor, the stakes are different but the same principle applies. What rights do they have beyond their ownership percentage? Do they get a say in day-to-day decisions, or only in major ones like selling the company? What information are you obligated to share with them, and how often? These are not relationship questions to figure out as they come up - they are terms that should exist in writing from the start.

The discomfort of having these conversations early is real, but it is far smaller than the discomfort of having them after a disagreement has already started, when trust is lower and everyone is more guarded. Treat the conversation as a sign of respect for the relationship and the business, not as an accusation that something is going to go wrong.

Treating legal groundwork as a one-time task rather than an ongoing responsibility is one of the most common mistakes new owners make. Requirements change as you add employees, add locations, or add new products and services, and a license or structure that was sufficient at launch may no longer cover what the business has become a year or two later. Building a simple annual habit of revisiting your legal and tax setup, even briefly, catches these gaps before they become expensive problems rather than after.

Today's question: is your ownership split, your decision rights, and your exit terms written down anywhere a lawyer would recognize as valid, or does the agreement exist only in conversation? If it only exists in conversation, what is the very next step to get it into writing?

We ask the questions. You write the answers, and we keep every one of them so the plan you make today is there to reference, not reconstructed from memory later.` },
  { topic: 'Law', subject: 'The contract you have not signed yet', message: `Every business runs on a stack of agreements - leases, vendor contracts, client agreements, employment terms, and service provider contracts - and most of them get signed quickly, under time pressure, without a full read. The cost of that habit usually shows up later, at the exact moment you can least afford a surprise.

A commercial lease is often the single largest and longest financial commitment a small business makes, yet it is frequently signed after reading only the rent amount and the term length. The real risk often hides in clauses about rent increases, who pays for repairs and maintenance, what happens if you need to break the lease early, and whether you are personally guaranteeing the lease beyond what your business entity would otherwise protect you from.

Vendor and supplier contracts carry their own risk, particularly around minimum order commitments, price change clauses, and what happens if they fail to deliver on time. A vendor agreement that looks like a simple purchase order can quietly obligate you to a minimum spend for a year, with penalties if you fall short, even if your sales do not go as planned.

Client and customer contracts deserve just as much attention, especially around payment terms, scope of work, liability if something goes wrong, and what happens if a client wants to cancel partway through a project. A contract that is vague about scope is one of the most common sources of disputes, because both sides can genuinely believe they agreed to something different.

If you have employees or contractors, employment agreements and independent contractor agreements carry legal weight around classification, confidentiality, non-compete terms where enforceable, and what happens to company property and client relationships if someone leaves. Getting this wrong is not just a financial risk - misclassifying an employee as a contractor can trigger real legal and tax consequences.

The practical habit to build is simple but rarely followed: read every contract fully before signing, even when it feels slow, and keep a simple log of key terms - renewal dates, payment terms, and exit clauses - for every active agreement. When a contract is complex or high-stakes, a short conversation with a lawyer before signing is almost always cheaper than resolving a dispute after the fact.

It is also worth periodically revisiting contracts you signed in the early, uncertain days of the business. Terms that made sense when you had no leverage and no track record may no longer serve you once you have proven revenue, reliability, and options. Renewal time is the natural moment to renegotiate, not just to resign the same terms out of habit.

Treating legal groundwork as a one-time task rather than an ongoing responsibility is one of the most common mistakes new owners make. Requirements change as you add employees, add locations, or add new products and services, and a license or structure that was sufficient at launch may no longer cover what the business has become a year or two later. Building a simple annual habit of revisiting your legal and tax setup, even briefly, catches these gaps before they become expensive problems rather than after.

Today's question: which contract currently active in your business did you sign without fully understanding every clause, and what is the one term in it you would want to revisit if you could?

We ask the questions. You write the answers, and we keep every one of them so you can track exactly which agreements need a second look.` },
  { topic: 'Law', subject: 'Protecting the name you chose', message: `The name of your business is one of the first real assets you create, often before you have a single dollar of revenue, and it deserves the same protection you would give any other valuable asset. Yet many new owners pick a name, design a logo, and start marketing before confirming the name is actually theirs to use and defend.

There are several layers of protection, and they are often confused with one another. Registering your business entity with the state secures the name only within that state's business registry, and only prevents another entity from registering the identical name in that state - it does not stop a similarly named business in another state, and it does not stop someone from using a similar name for a different type of business nearby.

A trademark is a different and stronger form of protection. Registering a trademark with the federal trademark office gives you exclusive rights to use that name, and a similar enough name, for your category of goods or services nationwide. Before you invest heavily in signage, packaging, and marketing, a trademark search can reveal whether your chosen name conflicts with an existing registered mark, which could otherwise force you to rebrand after you have already built recognition around it.

Domain names and social media handles are their own category entirely, governed by whoever registers them first, regardless of your business registration or trademark status. It is common for a new business to discover, after settling on a name, that the matching domain is already owned by someone else, sometimes a direct competitor and sometimes simply someone holding it to resell. Checking domain and handle availability early, ideally before falling in love with a name, saves significant frustration later.

If you discover a conflict after you have already started operating, the options narrow and the costs rise. You may be able to negotiate to purchase a domain, or operate under a slightly different public-facing name while keeping your legal entity name unchanged, but both paths cost time, money, and sometimes customer confusion during the transition.

The reverse risk also matters: if you have built a name with real reputation and value, protecting it means actively watching for others who might use something confusingly similar, and being prepared to assert your rights if that happens. A name with no protection is a name anyone else can eventually use, intentionally or not.

Treating legal groundwork as a one-time task rather than an ongoing responsibility is one of the most common mistakes new owners make. Requirements change as you add employees, add locations, or add new products and services, and a license or structure that was sufficient at launch may no longer cover what the business has become a year or two later. Building a simple annual habit of revisiting your legal and tax setup, even briefly, catches these gaps before they become expensive problems rather than after.

Today's question: could someone else legally use your exact business name, or something close enough to confuse your customers, somewhere else in the country tomorrow? If you are not certain of the answer, a simple trademark and domain search today will tell you where you actually stand.

We ask the questions. You write the answers, and we keep every one of them so your answer today becomes the record you check back against later.` },
  // Shop
  { topic: 'Shop', subject: 'Does your location actually fit your customer?', message: `A great location is not simply a place with high foot traffic or low rent - it is a place where the people walking, driving, or searching nearby are the same people who are actually likely to buy what you sell. Many businesses struggle not because the product is wrong, but because the location puts it in front of the wrong audience entirely.

Start with a clear picture of who your ideal customer actually is - their age range, income level, daily routine, and the kinds of errands or outings that bring them near a location like yours. A high-end boutique thrives near other high-end retail and offices with disposable income nearby, while a budget-focused service business may do far better near residential areas with steady, practical foot traffic rather than near upscale shopping districts where it does not fit the surrounding businesses.

Foot and vehicle traffic numbers matter, but only in context. A location with ten thousand cars passing per day means little if none of those drivers have a reason to stop, versus a location with a thousand cars per day where a meaningful percentage are already your target customer running a related errand. Raw traffic volume is a vanity number without a conversion story behind it.

Visibility and access matter just as much as proximity to customers. A location can be surrounded by the right people and still fail if it is hard to see from the road, awkward to park near, or tucked behind another building in a way that makes first-time visitors hesitant to find it. Ask yourself honestly whether someone who has never been to your business before could find and reach it without frustration.

It is also worth studying how people already move through the area before you commit. Spend time physically observing the location at different times of day and different days of the week, not just during a single walkthrough with a landlord. A location that looks lively on a Saturday afternoon tour can be nearly empty on a Tuesday morning, and your business needs to survive both.

Finally, consider the complementary businesses nearby, not just the competing ones. A location near businesses that serve a similar customer, without directly competing with you, can bring you customers who are already in the right mindset and the right budget range, effectively giving you free marketing exposure simply by being nearby.

A location decision is rarely final the moment you sign a lease - it is the beginning of an ongoing relationship with a place and a neighborhood that will keep shifting around you. Revisiting your assumptions about traffic, visibility, and surrounding businesses every few months, rather than assuming the conditions that led you to choose this spot will remain constant, keeps you from being surprised by a slow, gradual shift that only becomes obvious once it has already hurt the business.

Today's question: if you picture your single best customer, the one you most want to serve, can you picture them actually walking or driving past your current or planned location in the course of their normal week? If the honest answer is uncertain, what specific data could you gather this week to answer it with more confidence?

We ask the questions. You write the answers, and we keep every one of them so your location reasoning is documented, not just remembered.` },
  { topic: 'Shop', subject: 'Is your space the right size?', message: `Choosing a space that is too small quietly costs you sales every single day, while choosing one that is too large quietly drains cash every single month, and both mistakes are common because size decisions are usually made early, based on optimism rather than data, before the business has real sales history to guide the decision.

A space that is too small shows up in subtle ways before it becomes obvious. Customers wait longer because there is no room to serve more than a few at a time. Inventory gets stored inefficiently because there is no space to organize it properly, which slows down staff and creates errors. Employees working in cramped conditions make more mistakes and burn out faster. None of these costs appear on a single invoice, but together they quietly cap how much revenue the business can ever generate in that location.

A space that is too large has the opposite but equally serious problem: you are paying for square footage that produces no revenue. Unused space still costs rent, utilities, and often additional cleaning and maintenance. It can also create an atmosphere that feels empty or under-resourced to customers, even when the business itself is doing fine, simply because the space visually signals more capacity than the business is using.

The right way to approach size is to work backward from your actual operational needs rather than forward from what feels impressive or what happened to be available. Calculate how many customers you realistically expect to serve at peak times, how much inventory you need to store and how it should be organized, how many employees need to work simultaneously, and how much of the space is genuinely customer-facing versus back-of-house operations.

It is also worth building in room to grow, but deliberately and with a plan, not simply by renting more space than you need today and hoping you grow into it. A six-month or one-year growth projection, even a rough one, can tell you whether today's needs plus near-term growth justify slightly more space now, or whether you should plan to expand or relocate once growth actually arrives.

If you are already in a space and unsure whether the size fits, the data is usually available if you look for it: track how often you turn away customers due to space constraints, how much storage or back-of-house space sits unused, and how staff describe the workflow challenges they face daily. These real signals matter more than a gut feeling either way.

A location decision is rarely final the moment you sign a lease - it is the beginning of an ongoing relationship with a place and a neighborhood that will keep shifting around you. Revisiting your assumptions about traffic, visibility, and surrounding businesses every few months, rather than assuming the conditions that led you to choose this spot will remain constant, keeps you from being surprised by a slow, gradual shift that only becomes obvious once it has already hurt the business.

Today's question: if you had to prove, with real numbers rather than impressions, that your current square footage matches your actual sales volume and operational needs, could you do it? What is the first number you would need to gather to start that proof?

We ask the questions. You write the answers, and we keep every one of them so this analysis exists in writing the next time you consider expanding or relocating.` },
  { topic: 'Shop', subject: 'Who else is on your block?', message: `The businesses operating near yours shape your customer flow whether you have studied them or not, and treating your surroundings as background noise rather than useful information means missing one of the most accessible, lowest-cost sources of insight available to any location-based business.

Nearby competitors deserve honest, specific study, not a dismissive glance. What do they charge, what hours do they keep, what do their customers complain about in reviews, and what do those same customers praise? A competitor's one-star reviews are often a precise list of exactly what you need to do differently to win over customers who already live or work near you and already have a reason to try a business like yours.

Complementary businesses - ones that serve a similar customer without competing directly - represent a genuine opportunity rather than a threat. A coffee shop near a gym, a pet groomer near a veterinary office, or a tailor near a formal wear rental shop all benefit from shared foot traffic and a shared customer mindset. Building a simple cross-referral relationship with nearby complementary businesses can produce steady, low-cost customer flow that advertising dollars struggle to match.

It is also worth paying attention to vacancy and turnover on your block. A string of businesses that have failed or relocated in the same stretch is a signal worth investigating rather than ignoring, since it may point to a traffic, parking, visibility, or cost problem that will eventually affect you too, even if your specific business model differs from theirs.

Anchor businesses - larger, well-known establishments that draw significant and reliable traffic on their own - can dramatically change the value of a nearby location, sometimes justifying higher rent because of the customer flow they generate for everyone around them. Understanding whether your location benefits from a genuine anchor, or simply sits near unrelated businesses with no shared customer base, changes how much that location's traffic numbers actually mean for you.

A simple, practical exercise is to walk your block at different times of day and literally note every business within a five-minute walk, what they sell, and who their customer appears to be. This costs nothing but time, and it almost always reveals opportunities or risks that are invisible from a spreadsheet or a map alone.

A location decision is rarely final the moment you sign a lease - it is the beginning of an ongoing relationship with a place and a neighborhood that will keep shifting around you. Revisiting your assumptions about traffic, visibility, and surrounding businesses every few months, rather than assuming the conditions that led you to choose this spot will remain constant, keeps you from being surprised by a slow, gradual shift that only becomes obvious once it has already hurt the business.

Today's question: have you actually mapped out, business by business, what exists within a five-minute walk of your location, and what each one tells you about the customers already moving through your area? If not, what is stopping you from spending thirty minutes this week doing exactly that?

We ask the questions. You write the answers, and we keep every one of them so your map of the neighborhood becomes a resource you return to as things change.` },
  { topic: 'Shop', subject: 'What your foot traffic is really telling you', message: `Foot traffic is one of the most quoted numbers in location decisions and one of the most misunderstood, because people walking past your door are not the same as people walking into it, and people walking in are not the same as people buying something once they arrive. Treating raw traffic as a success metric on its own hides the actual story.

The real number that matters is your conversion rate - the percentage of people who pass by, or who enter, who actually become paying customers. A location with heavy foot traffic but low conversion may be attracting the wrong type of passerby entirely, or may have a storefront, signage, or entryway that fails to invite people in even when they are a good fit for what you offer.

Measuring this does not require expensive technology. A simple manual count over a representative period - counting people passing by during set time windows, and separately counting people who actually enter - gives you a real conversion percentage you can track over time and compare against changes you make, like new signage, a different window display, or adjusted hours.

It is also worth separating foot traffic by time of day and day of week rather than looking at a single blended average. A location that looks strong on Saturday afternoon but weak on weekday mornings tells you something specific about staffing, hours, and potentially even which products or services to emphasize when, rather than suggesting the location is simply good or bad overall.

Once someone enters, the next conversion point is just as important: how many browsers become buyers, and what influences that decision. This might be covered by your staff's approach, your pricing clarity, your checkout process, or simply whether what people see once inside matches what drew them in from the street. A mismatch between your exterior promise and your interior experience is a common, fixable source of lost conversions.

Comparing your conversion rate against industry benchmarks for your specific type of business, where available, can tell you whether your foot traffic problem is really a traffic problem or actually a conversion problem, which require very different solutions. Low traffic with strong conversion suggests a marketing or visibility fix. Strong traffic with low conversion suggests something closer to the entrance, the offer, or the in-store experience.

A location decision is rarely final the moment you sign a lease - it is the beginning of an ongoing relationship with a place and a neighborhood that will keep shifting around you. Revisiting your assumptions about traffic, visibility, and surrounding businesses every few months, rather than assuming the conditions that led you to choose this spot will remain constant, keeps you from being surprised by a slow, gradual shift that only becomes obvious once it has already hurt the business.

Today's question: do you actually know what percentage of people who pass your location come inside, and what percentage of those who come inside make a purchase? If you have never measured this, what is the simplest version of that measurement you could start this week, even with just a notebook and a count?

We ask the questions. You write the answers, and we keep every one of them so your conversion numbers build into a real trend line over time.` },
  { topic: 'Shop', subject: 'The lease clause everyone skips', message: `Most lease conversations focus almost entirely on the monthly rent figure, because it is the easiest number to compare across options and the one that feels most directly tied to affordability. But the clauses buried deeper in a commercial lease often matter more over the full term of the agreement than the headline rent number ever does.

Rent escalation clauses determine how much your rent increases each year, and the difference between a fixed, modest annual increase and an uncapped market-rate adjustment can mean paying dramatically more by year three or four, even if the initial rent looked identical to a competing space. Always ask specifically how rent changes over the full lease term, not just what it is on day one.

Renewal terms matter just as much as the initial term. A lease that expires with no guaranteed renewal option leaves you vulnerable to being pushed out, or facing a steep rent increase, right after you have invested in building a customer base at that location. Negotiating a renewal option with predefined terms, even if it costs slightly more upfront, protects the value you build over time.

Exit and early termination clauses deserve careful attention as well, particularly what penalty exists if your business needs to close or relocate before the lease term ends. Some leases require you to pay the remaining rent for the entire term regardless of whether you are operating, while others include more reasonable buyout or subletting provisions that reduce your risk if circumstances change.

Maintenance and repair responsibilities are another frequently overlooked area. Depending on the lease structure, you may be responsible for repairs to the building's systems, not just your interior space, which can mean unexpected, significant costs if an HVAC system or roof needs attention during your tenancy. Understanding exactly where your responsibility ends and the landlord's begins avoids an expensive surprise.

Personal guarantee clauses are worth reading especially carefully if you have formed an LLC or corporation specifically to protect your personal assets. Many landlords require a personal guarantee on a commercial lease regardless of your business entity, which means the legal protection you set up elsewhere does not necessarily extend to this particular obligation unless you specifically negotiate otherwise.

It is worth having a lawyer review any commercial lease before signing, even a short, simple-looking one, because the cost of that review is almost always small compared to the cost of being bound to unfavorable terms for years.

A location decision is rarely final the moment you sign a lease - it is the beginning of an ongoing relationship with a place and a neighborhood that will keep shifting around you. Revisiting your assumptions about traffic, visibility, and surrounding businesses every few months, rather than assuming the conditions that led you to choose this spot will remain constant, keeps you from being surprised by a slow, gradual shift that only becomes obvious once it has already hurt the business.

Today's question: do you know specifically what happens to your rent, your renewal rights, and your exit options in year three of your current or prospective lease? If you are not certain, what is the one clause you would want explained in plain language before signing?

We ask the questions. You write the answers, and we keep every one of them so the terms you agreed to are never a mystery later.` },
  { topic: 'Shop', subject: 'Your second-choice location', message: `Every location decision carries risk, no matter how much research goes into it, because markets shift, landlords change terms, and customer behavior evolves in ways no analysis fully predicts in advance. The businesses that recover quickly from a location that does not work out are almost always the ones that had already thought through an alternative before they needed one.

Having a second-choice location in mind is not about expecting failure - it is about removing the panic and the rushed decision-making that tend to produce bad outcomes when a change becomes necessary. If your current location underperforms, gets sold, raises rent beyond what you can sustain, or faces a neighborhood change that affects your customer base, having already identified a credible alternative means you can act from a position of consideration rather than desperation.

Building this backup does not require a full parallel lease negotiation or site analysis today. It can be as simple as maintaining a short list of two or three locations you would seriously consider, along with rough notes on their rent range, size, and why they would work for your business model. Revisiting and updating this list every six months or so keeps it realistic rather than outdated.

It is also worth thinking through what would actually trigger a relocation decision before you are in the middle of one emotionally. Is it a specific percentage rent increase you are unwilling to absorb? A certain decline in foot traffic or sales over a defined period? A change in the surrounding businesses that shifts your customer base? Defining these triggers in advance means you are more likely to notice them early and respond deliberately, rather than waiting until the situation has already become urgent.

Thinking through your second-choice location also sharpens your understanding of what actually matters about your current one. Comparing a potential alternative against your existing location forces you to articulate specifically what you would lose, and what you might gain, which often reveals factors about your current spot you had been taking for granted or hadn't fully considered.

This exercise is also useful leverage in negotiations. A landlord or property manager who senses you have no realistic alternative has little incentive to offer favorable terms at renewal. A tenant who can credibly discuss other options, even without acting on them, tends to negotiate from a stronger position.

A location decision is rarely final the moment you sign a lease - it is the beginning of an ongoing relationship with a place and a neighborhood that will keep shifting around you. Revisiting your assumptions about traffic, visibility, and surrounding businesses every few months, rather than assuming the conditions that led you to choose this spot will remain constant, keeps you from being surprised by a slow, gradual shift that only becomes obvious once it has already hurt the business.

Today's question: if this location failed or became unworkable tomorrow, where would you seriously consider going instead, and why would that location work for your business? If you cannot answer this with at least one specific alternative, what is the first step to identifying one this month?

We ask the questions. You write the answers, and we keep every one of them so your contingency thinking is documented, not just a passing thought.` },
  // Hired
  { topic: 'Hired', subject: 'Who should your first hire actually be?', message: `The first person you bring onto the team shapes the business in ways that go far beyond the specific tasks they handle, because they become the model for what every future hire is measured against, and they take on the first real test of whether your business can function without you personally doing everything.

Before deciding what kind of person to hire, it is worth being honest about which tasks genuinely require your specific judgment, relationships, or expertise, and which tasks simply require your time. Many owners default to hiring help for whatever feels most urgent in the moment, rather than stepping back to identify what only they can do and building the first hire around freeing up exactly that capacity.

A useful exercise is to track your own time honestly for a week or two, noting what you did in each block of time and whether it truly required your unique skills or could have been handled by someone else with reasonable training. Tasks that repeat often, that do not require deep business judgment, and that consume significant time are usually the best candidates for your first hire to absorb.

It is also worth considering the sequence of hires rather than just the first one in isolation. Some businesses benefit most from an operational hire who handles administrative and logistical work, freeing the owner to focus on sales and relationships. Others benefit more from a skilled hire who can directly deliver the core service or product, allowing the business to serve more customers simultaneously. The right first hire depends on where your personal time is currently the biggest bottleneck to growth.

Budget realism matters as much as role clarity. A first hire should be sized to what the business can sustainably afford, including the full cost of employment beyond just wages - payroll taxes, any benefits, equipment, and the time it takes to train them before they become fully productive. Hiring too early, before revenue supports it, can create cash flow strain that threatens the business at exactly the moment it needs stability.

Finally, consider how this first hire will set a cultural tone. The expectations you set, the training you provide, and the way you handle mistakes and feedback with this person will likely become the template every future employee experiences, whether you design it intentionally or let it happen by accident. Treating the first hire as an opportunity to build a deliberate culture, not just fill a gap, pays dividends well beyond the role itself.

Hiring decisions compound over time in ways that are easy to underestimate when you are focused on filling a single role. Each hire shapes who applies for the next opening, what your team expects from leadership, and how smoothly the business can eventually run without your constant direct involvement. Treating each hiring decision with real deliberation, rather than urgency-driven shortcuts, pays off far beyond the immediate role being filled.

Today's question: what is the one task currently consuming your time that does not actually require your unique judgment or relationships, and who could take it off your plate if you let them? Write down the specific task, not just a general sense that you need help.

We ask the questions. You write the answers, and we keep every one of them so your hiring decisions build on a clear, written record of what you actually need.` },
  { topic: 'Hired', subject: 'Hiring for skill or hiring for fit?', message: `A highly skilled hire who does not fit your culture can quietly cost a small business more than an inexperienced hire who fits well and grows into the role, yet most hiring processes are built almost entirely around evaluating skill, with culture fit treated as an afterthought or a vague gut feeling during the interview.

Skill is measurable and comfortable to evaluate - you can review a portfolio, ask technical questions, or set up a work sample test. Fit is harder to define and therefore easier to skip past, but it shows up constantly in small businesses where a handful of people work closely together, often under real pressure, and where one person's attitude or communication style can affect the entire team's morale and output.

Defining fit clearly, rather than leaving it as an unspoken feeling, makes it something you can actually evaluate during hiring. This might mean identifying specific values your business operates by - reliability, direct communication, comfort with ambiguity, genuine care for customers - and designing interview questions or scenarios that reveal how a candidate has actually behaved in situations that tested those values in the past.

It is also worth being honest about the tradeoffs rather than assuming skill and fit always align. A technically excellent candidate who struggles to communicate, resists feedback, or does not share the team's work ethic can create friction that slows everyone down, even while producing strong individual output. Conversely, a candidate with less experience but strong communication, coachability, and alignment with how your business operates can often be trained into the skill gap faster than a skilled person can be trained into genuine fit.

The hiring process itself can be adjusted to test for both. Beyond the standard interview, consider a paid trial project, a shadow day, or a structured reference check that specifically asks past managers or colleagues about communication style, reliability, and how the person handled disagreement or mistakes, not just their technical output.

It is also worth recognizing that fit does not mean hiring people who think and act exactly like you or the existing team. A healthy business benefits from different perspectives and working styles. Fit is really about shared commitment to how the work gets done and how people treat each other, not about sameness or personal similarity to the existing group.

Finally, remember that your evaluation of fit works both directions. A candidate is also assessing whether your business is a place they want to commit to, and the clarity and honesty you bring to the hiring process shapes how accurately they can make that decision, which affects how long they stay once hired.

Hiring decisions compound over time in ways that are easy to underestimate when you are focused on filling a single role. Each hire shapes who applies for the next opening, what your team expects from leadership, and how smoothly the business can eventually run without your constant direct involvement. Treating each hiring decision with real deliberation, rather than urgency-driven shortcuts, pays off far beyond the immediate role being filled.

Today's question: when you picture your next hire succeeding in the role, are you picturing their skill set, their personality and work style, or both equally? If you have not written down what fit actually means for your business specifically, what are the two or three values you would want any new hire to genuinely share?

We ask the questions. You write the answers, and we keep every one of them so your hiring standard becomes consistent rather than different for every candidate.` },
  { topic: 'Hired', subject: 'What you can actually afford to pay', message: `Pay decisions sit at the intersection of two real risks that pull in opposite directions: paying too little drives turnover and limits the quality of who applies, while paying more than the business can sustain strains cash flow long before revenue catches up to support it. Getting this balance right requires more than guessing at a number that feels fair.

The full cost of an employee extends well beyond the hourly wage or salary figure. Payroll taxes, workers compensation insurance, any benefits you offer, equipment and tools they need, and the ramp-up period where they are being trained and are not yet fully productive all add real cost on top of the base pay. A role that looks affordable at the wage level alone can be considerably more expensive once the full picture is calculated honestly.

Researching actual market rates for the specific role, in your specific geographic area, is worth real effort rather than guessing based on what feels reasonable. Industry associations, local job postings for comparable roles, and conversations with other business owners in your trade can give you a realistic range, rather than a number pulled from a national average that may not reflect your local market at all.

It is also worth thinking about pay structure, not just the number. A role might be better served by a base wage plus performance incentives, rather than a higher flat wage, particularly for roles where output directly affects revenue, like sales or production-based work. This can align what you pay more closely with what the business actually earns, reducing risk during slower periods while still rewarding strong performance.

Cash flow timing matters as much as the annual total. A new hire's pay needs to be sustainable not just on average across the year, but specifically during your slowest months, since payroll obligations do not pause for a slow season the way discretionary spending might. Modeling your cash flow with the new hire's full cost included, across your actual seasonal pattern, reveals whether the timing works, not just the yearly math.

It is also worth building in a plan for raises and reviews from the start, even if the increases are modest early on. Employees who see no path for their pay to grow as they gain skill and take on more responsibility are more likely to look elsewhere, and losing a trained employee to a competitor over a pay gap you could have addressed is one of the more preventable costs in a small business.

Hiring decisions compound over time in ways that are easy to underestimate when you are focused on filling a single role. Each hire shapes who applies for the next opening, what your team expects from leadership, and how smoothly the business can eventually run without your constant direct involvement. Treating each hiring decision with real deliberation, rather than urgency-driven shortcuts, pays off far beyond the immediate role being filled.

Today's question: have you calculated what this role actually costs you over a full year, including taxes, any benefits, training time, and equipment, not just the headline wage? If you have not run that full calculation, what is the first number you would need to gather to complete it?

We ask the questions. You write the answers, and we keep every one of them so your pay decisions are grounded in real numbers you can revisit.` },
  { topic: 'Hired', subject: 'What does success look like for this role?', message: `If you cannot describe, in specific and concrete terms, what a great week looks like for someone in a role, they have no real way to aim for it, no matter how capable or motivated they are. Vague expectations like "do a good job" or "be proactive" feel reasonable to say but give an employee almost nothing to actually act on.

Defining success starts with identifying what outcomes actually matter for the role, not just the tasks involved. A customer service role is not successful simply because calls were answered - it is successful because customers left the interaction satisfied, issues were actually resolved, and repeat problems were flagged rather than repeatedly patched over. Identifying the real outcome, not just the activity, changes what you measure and what you coach toward.

Once the outcome is clear, breaking it into a small number of specific, observable measures makes it something you can actually track and discuss. This might include a customer satisfaction score, a resolution rate, or a specific quality checklist for a production role. The goal is not to create an overwhelming number of metrics, but to identify the two or three that genuinely capture whether the role is being performed well.

It is equally important to define what success looks like early in someone's tenure versus later. A new hire in their first month should be measured against learning milestones and foundational competence, not the same performance bar as someone who has been in the role for a year. Conflating these two timelines is a common source of frustration on both sides, where a manager feels a new hire is underperforming and the employee feels they are being judged unfairly against an unrealistic standard.

Communicating this clearly is just as important as defining it internally. A written, simple description of what success looks like for the role - shared during onboarding and revisited during reviews - gives an employee a stable reference point, rather than relying on them to infer expectations from scattered comments or corrections over time.

This clarity also benefits you directly as the owner or manager. When expectations are specific and documented, performance conversations become easier and less personal, because you are comparing actual results against an agreed standard rather than relying on a general feeling that something is not quite right. It also makes it far easier to recognize and reward genuine strong performance, since you have a concrete standard to point to.

Hiring decisions compound over time in ways that are easy to underestimate when you are focused on filling a single role. Each hire shapes who applies for the next opening, what your team expects from leadership, and how smoothly the business can eventually run without your constant direct involvement. Treating each hiring decision with real deliberation, rather than urgency-driven shortcuts, pays off far beyond the immediate role being filled.

Today's question: could you write down, in one or two sentences, exactly what a great week looks like for your next hire or your current team members? If you cannot do this easily, what is the one outcome that matters most for this role, and how would you know if it was actually happening?

We ask the questions. You write the answers, and we keep every one of them so your definition of success is documented and consistent over time.` },
  { topic: 'Hired', subject: 'Employee or contractor?', message: `The distinction between an employee and an independent contractor is not simply a paperwork preference - it is a legal classification with specific rules behind it, and misclassifying someone, even unintentionally, can expose a business to back taxes, penalties, and legal liability that can be significant relative to the size of a small business.

The classification generally hinges on control and independence. An employee typically works set hours you determine, uses equipment and processes you provide, and is integrated into your business's ongoing operations. A contractor typically sets their own hours, uses their own tools and methods, works for multiple clients, and is engaged for a specific project or outcome rather than ongoing, directed work.

Many small businesses default to classifying workers as contractors because it appears simpler - no payroll taxes, no benefits obligations, and more flexibility to end the relationship. But if the actual working relationship looks more like employment in practice, regardless of what the agreement is titled, regulators can reclassify the relationship after the fact, often triggering back payroll taxes, penalties, and sometimes additional wage claims.

The specific factors that matter vary somewhat by jurisdiction, but generally include how much control you exercise over how and when the work is performed, whether the person provides services to other clients as well, whether they use their own equipment and bear their own business expenses, and whether the relationship is ongoing and integrated into your core operations versus project-based and separate.

If you are uncertain about a current or planned working relationship, it is worth a direct conversation with an accountant or employment attorney rather than guessing. The cost of that conversation is almost always smaller than the cost of a misclassification finding, which can include retroactive taxes and penalties covering the entire period of the misclassified relationship, not just going forward.

It is also worth building a simple, periodic review of your contractor relationships, since a working relationship can shift over time even if the original classification was correct. A contractor who was originally brought on for a single project but has gradually taken on ongoing, directed work indistinguishable from an employee role may need to be reclassified as the relationship evolves, even if nothing was done incorrectly at the start.

Hiring decisions compound over time in ways that are easy to underestimate when you are focused on filling a single role. Each hire shapes who applies for the next opening, what your team expects from leadership, and how smoothly the business can eventually run without your constant direct involvement. Treating each hiring decision with real deliberation, rather than urgency-driven shortcuts, pays off far beyond the immediate role being filled.

Today's question: are you confident that every person currently working for your business, whether called an employee or a contractor, is classified correctly based on how the work relationship actually functions day to day, not just what the agreement says on paper? If you are not fully confident, which specific relationship would you want reviewed first?

We ask the questions. You write the answers, and we keep every one of them so this review is documented and not left as an assumption.` },
  { topic: 'Hired', subject: 'What happens in their first week?', message: `A new hire's first week does more to determine whether they stay three months or three years than almost any other period of their employment, yet it is frequently the least planned part of the hiring process, often improvised on the spot once the person actually shows up for their first day.

The first day sets an immediate tone. A new hire who arrives to a workspace that is not ready, a schedule no one communicated, or a team that was not expecting them forms an early impression that the business is disorganized, even if that is not representative of how things usually run. Simple preparation - a ready workspace, a clear first-day schedule, and a team briefed on who is joining - costs little but changes that first impression significantly.

Beyond logistics, the first week should answer the questions every new hire is silently asking, even if they do not say them aloud: what does success look like here, who do I go to with questions, what are the unwritten rules of how this team operates, and did I make the right decision taking this job. A first week that leaves these questions unanswered creates uncertainty that can quietly erode confidence and commitment even in someone who was genuinely excited to join.

Structuring the first week with a mix of role-specific training and broader orientation helps balance immediate productivity with long-term integration. Front-loading only task training without context about the business, the customers, and the team can leave a new hire technically capable but disconnected from why the work matters, which affects motivation and judgment in ambiguous situations down the line.

Assigning a specific point of contact, separate from the owner or manager if possible, gives a new hire someone low-stakes to ask questions without feeling like they are bothering the person who hired them or who evaluates their performance. This simple structure, sometimes called a buddy or mentor system, measurably improves how quickly new hires become comfortable and productive.

It is also worth building in a short, informal check-in at the end of the first week, not to evaluate performance yet, but to ask how things are going, what has been confusing, and what support they feel they need. This early signal can reveal onboarding gaps you can fix immediately, before they compound into larger frustration or an early departure.

The investment required to plan a deliberate first week is genuinely small compared to the cost of replacing a hire who leaves within the first few months, which includes not just the direct cost of rehiring but the lost productivity, training time, and team disruption that comes with turnover.

Hiring decisions compound over time in ways that are easy to underestimate when you are focused on filling a single role. Each hire shapes who applies for the next opening, what your team expects from leadership, and how smoothly the business can eventually run without your constant direct involvement. Treating each hiring decision with real deliberation, rather than urgency-driven shortcuts, pays off far beyond the immediate role being filled.

Today's question: do you have a real, written plan for someone's first day and first week, or will you figure it out when they show up? If you do not have a plan yet, what are the three things you would want a new hire to understand by the end of their first week?

We ask the questions. You write the answers, and we keep every one of them so your onboarding plan improves each time you use it.` },
  // Customer
  { topic: 'Customer', subject: 'What makes your customer happy?', message: `Happy customers are the foundation of sustainable growth, because they return, they spend more over time, and they tell others, often more effectively than any advertising a small business could afford. Yet many owners describe their customer experience in general terms - friendly service, good quality - without being able to name the specific moment that actually creates genuine satisfaction.

Identifying this moment requires looking past surface-level politeness and toward the actual outcome a customer came for. A customer at a repair shop is not made happy by a friendly greeting alone - they are made happy when their problem is genuinely solved, explained clearly, and resolved without unnecessary cost or delay. The friendliness matters, but it supports the outcome rather than replacing it.

One effective way to find this moment is to ask your best, most loyal customers directly why they keep coming back, rather than assuming you already know. Their answers are often more specific and more useful than you expect, revealing details about your business you may take for granted internally but that genuinely matter to the people you serve.

It is also worth examining your actual process, step by step, from the customer's perspective rather than your own. Where in that process does a customer's posture or tone visibly shift toward relief, gratitude, or enthusiasm? That shift point is usually where your real value is delivered, and understanding it precisely allows you to protect and even amplify it deliberately, rather than hoping it happens consistently by accident.

Once you have identified this moment, the next step is making sure it happens reliably, not just occasionally with your best staff on their best day. This might mean training every employee specifically around that moment, building a process checkpoint that ensures it is not skipped under time pressure, or simplifying other parts of the experience so that energy and attention remain available for the part that matters most.

It is also worth recognizing that the moment of happiness may differ slightly across different customer segments you serve. A first-time customer may be made happy primarily by a smooth, low-friction first experience, while a long-term customer may value recognition, consistency, or a sense of being known, which requires a different kind of attention than simply repeating the first-time experience.

Customer relationships are rarely static - the same person who was thrilled with their first experience can quietly become indifferent if attention and consistency fade over time, and a customer who was once lukewarm can become a genuine advocate if a specific moment of care changes their impression. Revisiting your understanding of customer sentiment regularly, rather than relying on an impression formed once and never updated, keeps your business responsive to how relationships are actually evolving.

Today's question: can you name the exact moment in your service or product delivery that makes a customer genuinely happy, not just satisfied? If you cannot name it precisely, what is the first question you could ask three of your best customers this week to find out?

We ask the questions. You write the answers, and we keep every one of them so your understanding of what creates real satisfaction keeps growing more precise over time.` },
  { topic: 'Customer', subject: 'What makes your customer leave unhappy?', message: `Every business has a specific failure point that customers remember far longer and more vividly than any number of smooth, unremarkable interactions, and understanding that point precisely is one of the most valuable things an owner can do, yet it is often avoided because it requires sitting with uncomfortable feedback rather than pleasant praise.

The instinct when a customer complaint arrives is often to treat it as an isolated incident - a bad day, a difficult customer, a one-off mistake. But patterns matter more than individual complaints, and a business that tracks complaints systematically, rather than reacting to each one separately, often discovers that a small number of root causes are responsible for a disproportionate share of dissatisfaction.

Identifying the real failure point requires distinguishing between the surface complaint and the underlying cause. A customer who complains about a long wait time may actually be frustrated by a lack of communication about the wait, not the wait itself. A customer upset about a product defect may be more upset by how the issue was handled afterward than by the defect in the first place. Looking past the stated complaint to the actual unmet expectation reveals what truly needs to change.

Reviews, whether left publicly online or gathered through direct feedback requests, are a valuable and often underused source of this information. Reading negative reviews not defensively, but as a specific list of what to fix, can reveal patterns that are difficult to see from inside daily operations, where small frustrations may feel normal simply because they happen often.

It is also worth examining your own internal data, where available - return rates, refund requests, cancelled appointments, or support tickets - for patterns rather than treating each instance as unrelated. A spike in a specific type of complaint around a specific product, service, or time period usually points to a specific, fixable cause rather than general bad luck or difficult customers.

Once a real failure point is identified, the fix is rarely about blaming staff or hoping people try harder. It usually requires a process change - a different communication step, a revised policy, a quality control checkpoint, or additional training focused specifically on that moment - something structural that prevents the failure rather than relying on individual effort to catch it every time.

It is worth remembering that customers who complain are often more valuable than customers who leave silently. A complaint is an opportunity to fix the relationship and the underlying problem. Silence usually means a customer has simply moved on to a competitor without giving you the chance to know why.

Customer relationships are rarely static - the same person who was thrilled with their first experience can quietly become indifferent if attention and consistency fade over time, and a customer who was once lukewarm can become a genuine advocate if a specific moment of care changes their impression. Revisiting your understanding of customer sentiment regularly, rather than relying on an impression formed once and never updated, keeps your business responsive to how relationships are actually evolving.

Today's question: what is the one thing that, if it goes wrong, reliably turns a customer against your business? If you are not certain, what is the fastest way you could find out this week, whether through reviews, direct feedback, or your own internal records?

We ask the questions. You write the answers, and we keep every one of them so patterns become visible over time instead of staying hidden in isolated incidents.` },
  { topic: 'Customer', subject: 'The customers in between', message: `Most conversations about customer satisfaction focus on the extremes - the thrilled customer who leaves a glowing review, or the furious customer who complains loudly. But the majority of customers live somewhere in the middle, quietly satisfied enough not to complain, but not enthusiastic enough to return automatically or recommend you to others, and this large middle group is where much of your future growth or decline is actually decided.

The danger of the middle group is its silence. A customer who is mildly disappointed rarely tells you directly - they simply do not come back next time, often without any specific incident you could point to and address. Because there is no complaint to respond to, this slow erosion can continue unnoticed for a long time, showing up eventually as declining repeat business without an obvious cause.

Measuring satisfaction among this middle group requires more deliberate effort than simply watching for complaints or counting five-star reviews. Short, simple feedback requests - a quick follow-up message, a brief survey, or even a direct question asked in person - can surface specific, moderate concerns that a customer would never have raised unprompted, but is willing to share when genuinely asked.

It is also worth looking at behavioral signals rather than relying only on direct feedback. Are repeat customers returning as often as they used to? Is the average time between visits lengthening? Are customers who used to add extra items or services to their purchase now buying only the minimum? These patterns often reveal softening satisfaction well before it shows up as an outright complaint or a lost customer.

Understanding what specifically separates a thrilled customer from a merely satisfied one often comes down to small, addressable details - a slightly faster response time, a bit more personal attention, a small unprompted gesture of goodwill when something goes slightly wrong. These details are frequently inexpensive to implement but require conscious attention, because they rarely happen automatically under the pressure of daily operations.

It is worth treating the middle group as your biggest opportunity rather than an acceptable baseline. Moving even a modest percentage of merely satisfied customers into genuinely enthusiastic ones can meaningfully increase repeat business and referrals, often more cost-effectively than acquiring entirely new customers through advertising.

Customer relationships are rarely static - the same person who was thrilled with their first experience can quietly become indifferent if attention and consistency fade over time, and a customer who was once lukewarm can become a genuine advocate if a specific moment of care changes their impression. Revisiting your understanding of customer sentiment regularly, rather than relying on an impression formed once and never updated, keeps your business responsive to how relationships are actually evolving.

Today's question: how do you currently know whether your average customer, not your best or your worst, is genuinely satisfied or simply tolerating your business without complaint? If you do not have a clear answer, what is one simple way you could check this week?

We ask the questions. You write the answers, and we keep every one of them so you can track whether your middle group is moving toward enthusiasm or quietly drifting away.` },
  { topic: 'Customer', subject: 'Who is your customer, really?', message: `A business that tries to serve everyone often ends up serving no one particularly well, because every decision about product, pricing, location, and messaging involves tradeoffs, and without a clear picture of your actual ideal customer, those tradeoffs get made inconsistently or by default rather than deliberately.

Defining your ideal customer goes well beyond basic demographics like age or income. It should capture what problem they are actually trying to solve, what alternatives they are considering besides you, what matters most to them in making that decision, and what would make them an enthusiastic, repeat customer rather than a one-time transaction.

A useful exercise is to think of your actual best customers - not hypothetical ones, but real people or businesses you currently serve who exemplify what you want more of. What do they have in common? Why did they choose you? What do they value most about the experience? Patterns among your genuinely best existing customers are usually more reliable guides than abstract market research or assumptions about who you think should want your product.

It is also worth being honest about who you are not serving well, even if they are currently paying customers. Some customers consume a disproportionate amount of time, create more complaints, or expect a different value proposition than what you actually offer. Recognizing this is not about being dismissive of certain customers, but about recognizing that trying to satisfy a customer who fundamentally wants something different from what you provide usually frustrates both sides.

Once you have a clear picture of your ideal customer, it should actively inform decisions across the business, not sit as a forgotten exercise in a notebook. Your marketing language, your pricing structure, your hours of operation, and even your location and store layout should reflect what actually matters to this specific person, rather than trying to appeal broadly to anyone who might possibly want what you sell.

It is also worth revisiting this definition periodically as your business evolves. The customer who was right for you in your first year, when you needed any paying customer to build momentum, may differ from the customer who is right for you once you have established a reputation and want to grow more deliberately and profitably.

Customer relationships are rarely static - the same person who was thrilled with their first experience can quietly become indifferent if attention and consistency fade over time, and a customer who was once lukewarm can become a genuine advocate if a specific moment of care changes their impression. Revisiting your understanding of customer sentiment regularly, rather than relying on an impression formed once and never updated, keeps your business responsive to how relationships are actually evolving.

Today's question: if you had to describe your one ideal customer in a single, specific sentence - not a broad category, but a real type of person or business - what would you say? If you struggle to answer specifically, which three of your actual current customers best represent who you want more of?

We ask the questions. You write the answers, and we keep every one of them so your definition sharpens and evolves as you learn more.` },
  { topic: 'Customer', subject: 'How do customers find you?', message: `Understanding how customers actually discover your business is one of the most practical pieces of information a small business can gather, yet it is frequently assumed rather than measured, with owners relying on a general sense of where their marketing effort goes rather than concrete data about where their actual customers come from.

Word of mouth, online search, social media, paid advertising, walking by, and referrals from other businesses all bring different kinds of customers, often with different expectations, different price sensitivity, and different likelihood of becoming repeat customers. Treating all customer acquisition as equivalent misses important differences in how to serve and retain each type.

The simplest way to gather this information is to ask directly, consistently, and specifically. A brief question at the point of sale or during onboarding - how did you hear about us - costs nothing and, tracked over time, reveals real patterns about which channels are actually working, rather than which ones you assume are working based on where you spend the most effort or money.

It is worth being specific in how you track the answers rather than lumping everything into vague categories. "Social media" covers everything from a friend's personal recommendation shared online to a paid advertisement, and these represent very different acquisition paths with different costs and different customer expectations attached to them.

Once you understand your real channels, it becomes possible to evaluate them honestly against their actual cost and the quality of customer they bring. A channel that brings in many customers at low cost but low loyalty may be less valuable than a channel that brings fewer customers but ones who spend more and return more often. Without channel-specific data, these differences remain invisible, and marketing decisions get made on the loudest activity rather than the most profitable one.

It is also worth paying attention to how acquisition channels shift over time. A channel that drove significant business in your first year may decline in effectiveness as a market becomes saturated or as customer behavior shifts, while a channel you have underinvested in may represent genuine untapped opportunity. Regularly revisiting this data, rather than assuming your original channel mix remains correct indefinitely, keeps your marketing effort aligned with where your actual customers now come from.

Referral and word-of-mouth tracking deserves particular attention, since it is often the most valuable channel for a small business and the easiest to overlook because it does not involve a direct advertising spend to measure against. Understanding specifically which customers refer others, and why, can reveal opportunities to actively encourage and support more of this low-cost, high-trust acquisition.

Customer relationships are rarely static - the same person who was thrilled with their first experience can quietly become indifferent if attention and consistency fade over time, and a customer who was once lukewarm can become a genuine advocate if a specific moment of care changes their impression. Revisiting your understanding of customer sentiment regularly, rather than relying on an impression formed once and never updated, keeps your business responsive to how relationships are actually evolving.

Today's question: do you actually know, with real data rather than an assumption, how most of your customers first heard about your business? If not, what is the simplest question you could start asking at the point of sale this week to begin finding out?

We ask the questions. You write the answers, and we keep every one of them so your channel data builds into a real picture over time.` },
  { topic: 'Customer', subject: 'What brings a customer back a second time?', message: `The first sale to a new customer is, in many ways, the easiest one a business makes, because it is often driven by curiosity, a promotion, convenience, or simple proximity. The second sale is a different and more meaningful achievement, because it means the customer chose you again, specifically, after having a real experience to judge you by, and this is where sustainable businesses are actually built.

Understanding what drives a second visit requires looking past the transaction itself and toward the full experience surrounding it. Was the product or service good enough on its own, or did something else matter just as much - how they were treated, how easy the process was, whether a small problem was handled well, or whether they simply remembered you existed when the need arose again.

Timing plays a significant role that is often overlooked. If your product or service has a natural repeat cycle - a certain number of weeks or months before a customer would plausibly need you again - staying visible and top of mind during that window matters considerably. A customer who had a perfectly good first experience can still drift to a competitor simply because that competitor happened to be more visible when the need resurfaced.

Creating a specific reason to return, rather than relying on a customer to remember you unprompted, can meaningfully increase repeat business. This might be a simple follow-up message checking in on their experience, a modest incentive for a return visit, or a natural next step in your service that logically follows the first purchase, giving the customer an obvious reason to come back rather than evaluate alternatives from scratch.

It is also worth examining whether anything about the first experience inadvertently discourages a return, even when the core product or service was good. A confusing checkout process, an unclear way to book a follow-up appointment, or simply no communication after the first purchase can all quietly reduce the odds of a second visit, even among customers who were genuinely satisfied with what they received.

Measuring your actual repeat rate - what percentage of first-time customers return within a defined period - gives you a concrete number to track and improve, rather than relying on a general impression of loyalty. Small, specific changes aimed at improving this number, tested over time, often produce more reliable growth than acquiring an equivalent number of entirely new customers.

Customer relationships are rarely static - the same person who was thrilled with their first experience can quietly become indifferent if attention and consistency fade over time, and a customer who was once lukewarm can become a genuine advocate if a specific moment of care changes their impression. Revisiting your understanding of customer sentiment regularly, rather than relying on an impression formed once and never updated, keeps your business responsive to how relationships are actually evolving.

Today's question: what specifically gives a customer a reason to come back to you instead of trying a competitor next time the need arises? If you are not certain, what could you add, even something small, to create a clearer, more deliberate reason to return?

We ask the questions. You write the answers, and we keep every one of them so your repeat customer strategy keeps sharpening over time.` },
  // Saving
  { topic: 'Saving', subject: 'How much should you actually have saved?', message: `A cash reserve is not a luxury reserved for businesses that are already comfortable - it is the single factor most likely to determine whether a temporary setback becomes a minor inconvenience or an existential threat to the business. Yet many small businesses operate with little to no reserve, treating every dollar of profit as available to spend or distribute immediately.

The purpose of a reserve is specific: it exists to cover a defined period of reduced or interrupted revenue without forcing immediate, reactive decisions like laying off staff, missing vendor payments, or taking on high-cost emergency debt. Businesses with seasonal revenue, a concentrated customer base, or exposure to supply disruptions face this risk more directly, but every business faces some version of unpredictable revenue dips.

Calculating an appropriate reserve size starts with understanding your actual fixed costs - the expenses that continue regardless of revenue, such as rent, minimum staffing, loan payments, and essential utilities. A common starting benchmark is three to six months of these fixed costs, though the right number depends on how volatile your specific revenue tends to be and how quickly you could reduce costs if needed.

It is worth running the actual scenario rather than relying on a rule of thumb alone. If your revenue dropped by a meaningful percentage, say thirty or forty percent, for two consecutive months, could your current reserve cover the resulting shortfall while still paying your fixed obligations? This concrete exercise often reveals whether your reserve target feels adequate in theory but falls short in a realistic scenario.

Building the reserve itself requires treating it as a non-negotiable expense rather than whatever happens to be left over after everything else is paid. Setting aside a fixed percentage of revenue automatically, ideally through an automatic transfer to a separate account, removes the temptation to skip the contribution during a busy month when cash feels abundant and the perceived need to save feels lower.

It is also worth protecting the reserve once it exists, which means defining in advance what circumstances justify using it, separate from the daily temptation to use available cash for a new opportunity or a want rather than a genuine need. A reserve that gets spent on the first appealing opportunity is not functioning as a reserve at all, regardless of what it was originally intended for.

Finally, revisit your reserve target periodically as the business changes. A reserve sized appropriately for your business two years ago may be too small or unnecessarily large today, depending on how your fixed costs, revenue stability, and growth plans have shifted since then.

Financial discipline around saving is easiest to maintain in theory and hardest to maintain in practice, precisely because the moments that test it - a strong month that invites spending, or a slow month that invites skipping a contribution - are the exact moments the habit matters most. Building saving into an automatic, non-negotiable process, rather than a decision remade every month, is what separates businesses that actually have a reserve when they need one from those that always meant to build one.

Today's question: if your revenue dropped forty percent for two consecutive months starting today, could your current savings cover the gap while still meeting your fixed obligations? If the honest answer is no, what is the first number you need to calculate to find your real target?

We ask the questions. You write the answers, and we keep every one of them so your reserve planning is grounded in real numbers you can revisit.` },
  { topic: 'Saving', subject: 'Saving for the business, not just yourself', message: `Personal savings and business reserves often get mentally blended together, especially in a small or solo-owned business, but treating them as the same safety net creates real risk, because a personal emergency and a business emergency can both arrive at once, and a single combined reserve cannot adequately cover both simultaneously.

A business reserve exists specifically to protect business operations - covering payroll, rent, and essential expenses during a revenue disruption without requiring the owner to inject personal funds or take on expensive debt. A personal reserve exists to protect the owner's household and family financial stability, independent of how the business is performing in any given month.

When these two are blended, a business downturn can directly threaten personal financial security, and a personal financial setback can pull cash out of the business at exactly the wrong time. Separating them, even if both reserves are currently modest, creates a clearer picture of true financial health in each area and prevents one crisis from automatically becoming two.

Building a dedicated business reserve starts with the same discipline as any savings goal: a specific account, separate from both personal accounts and day-to-day business operating accounts, with a defined contribution rate and a defined purpose. Resist the temptation to view this account as simply another place where business cash happens to sit, available for any business expense that arises.

It is also worth being honest about how much the business currently depends on the owner's personal financial cushion to survive slow periods. If personal savings have been used to cover business shortfalls in the past, this is a signal that the business reserve is inadequate and needs deliberate attention, rather than simply hoping personal finances remain available as a backstop indefinitely.

As the business grows and potentially takes on employees, maintaining this separation becomes even more important, both for sound financial management and for the legal protections an entity structure is supposed to provide. Commingling personal and business funds can undermine liability protections in addition to creating financial confusion.

This separation also changes how you think about profit distributions. Rather than viewing all business profit as either immediately spendable or immediately distributable to the owner, a portion should be allocated specifically to building and maintaining the business reserve before any distribution decisions are made, treating the reserve contribution as a required expense rather than an optional one.

Financial discipline around saving is easiest to maintain in theory and hardest to maintain in practice, precisely because the moments that test it - a strong month that invites spending, or a slow month that invites skipping a contribution - are the exact moments the habit matters most. Building saving into an automatic, non-negotiable process, rather than a decision remade every month, is what separates businesses that actually have a reserve when they need one from those that always meant to build one.

Today's question: does your business currently have its own dedicated reserve, genuinely separate from your personal savings, or have the two been functioning as one combined safety net? If they are combined, what is the first step to separating them, even if both start small?

We ask the questions. You write the answers, and we keep every one of them so this separation becomes a documented decision, not just an intention.` },
  { topic: 'Saving', subject: 'What triggers you to use your reserve?', message: `A reserve without a clear rule for when to use it tends to get spent gradually on whatever opportunity or convenience arises, rather than being preserved for the genuine emergency it was originally built to cover. Defining specific triggers in advance, while you are thinking clearly and not under financial pressure, protects the reserve from this slow erosion.

The absence of a clear trigger creates a subtle but real risk: every reasonably good opportunity - new equipment, a marketing push, an appealing hire - can be framed as worth dipping into savings for for, especially when the business is performing reasonably well and the reserve feels like simply extra cash sitting available. Without a defined boundary, the reserve shrinks incrementally until it is no longer capable of serving its original purpose.

Defining triggers starts with naming the specific scenarios the reserve exists to protect against: a defined percentage drop in revenue sustained over a specific period, an unexpected major expense like equipment failure or an uninsured loss, or a temporary gap between a known upcoming expense and expected incoming revenue. These scenarios should be specific enough that you can clearly recognize when you are actually in one, rather than vague enough to justify almost any use.

It is equally important to define what does not qualify as a legitimate trigger, even when the opportunity feels compelling in the moment. A growth opportunity, however attractive, is fundamentally different from a revenue emergency, and funding growth from the reserve undermines the very protection the reserve is meant to provide, even if the growth opportunity itself is a reasonable business decision to pursue through other means.

Writing these triggers down, rather than keeping them as a general intention, creates real accountability, especially valuable in the moment when a tempting use case arises and emotional reasoning might otherwise override the original plan. A written trigger list, even a short one, becomes something you can check an impulse against rather than relying on in-the-moment judgment alone.

It is also worth defining a replenishment plan alongside the usage triggers. If the reserve is used for a legitimate emergency, having a predetermined plan for how and over what timeframe it gets rebuilt prevents the business from operating indefinitely with reduced protection after the first real test of the system.

Reviewing your triggers periodically, particularly after any situation where you considered using the reserve, whether you ultimately did or not, helps refine them based on real experience rather than theoretical planning alone, making the system more useful and more realistic over time.

Financial discipline around saving is easiest to maintain in theory and hardest to maintain in practice, precisely because the moments that test it - a strong month that invites spending, or a slow month that invites skipping a contribution - are the exact moments the habit matters most. Building saving into an automatic, non-negotiable process, rather than a decision remade every month, is what separates businesses that actually have a reserve when they need one from those that always meant to build one.

Today's question: do you know exactly what situation would justify using your business reserve, specifically enough that you could recognize it clearly if it happened today? If you have not written this down, what are the two or three scenarios you would consider genuine triggers?

We ask the questions. You write the answers, and we keep every one of them so your trigger definitions are there to check against, not just remembered loosely.` },
  { topic: 'Saving', subject: 'Saving versus reinvesting', message: `Every dollar of profit represents a real choice between two reasonable paths: strengthening the business's financial cushion through savings, or deploying that dollar toward growth through reinvestment. Neither choice is inherently correct, and businesses that default consistently to one without deliberately weighing the other often end up either dangerously under-protected or unnecessarily stagnant.

The case for reinvesting is strongest when a specific, well-understood opportunity exists with a reasonably predictable return - a piece of equipment that clearly increases capacity, a marketing channel with a proven and measurable return, or a hire that directly addresses a bottleneck currently limiting growth. Reinvestment works best when you can articulate specifically what the dollar produces, not just a general sense that growth is good.

The case for saving is strongest when your reserve is below your calculated target, when your revenue has notable volatility or seasonality, or when significant known expenses or risks are on the horizon that are not yet fully funded. A thin reserve combined with aggressive reinvestment creates a business that looks like it is growing quickly while actually becoming more fragile with each decision.

A useful practical approach is to establish a rule for how profit gets allocated by default, rather than deciding fresh each time profit arrives, which tends to favor whatever feels most exciting or urgent in the moment. This might mean a fixed percentage automatically directed to the reserve until it reaches your target, with the remainder available for reinvestment or distribution decisions.

It is also worth evaluating reinvestment opportunities with the same rigor you would apply to any other spending decision, rather than treating "growth" as an automatically justified category. What specific outcome is expected, over what timeframe, and how will you know if it worked? Reinvestment without this clarity often produces activity without a measurable return, consuming cash without strengthening the business in a way you can verify.

Timing also matters considerably. Reinvestment decisions made during a strong revenue period should still account for your typical slow periods, since a growth investment that strains cash flow during your predictable slow season can create problems regardless of how promising the opportunity appeared when the decision was made.

It is worth revisiting this balance periodically as the business evolves, since the right allocation between saving and reinvesting in year one, when building any reserve at all matters most, looks different from the right allocation in year five, once a solid reserve exists and genuine growth opportunities have become clearer and more proven.

Financial discipline around saving is easiest to maintain in theory and hardest to maintain in practice, precisely because the moments that test it - a strong month that invites spending, or a slow month that invites skipping a contribution - are the exact moments the habit matters most. Building saving into an automatic, non-negotiable process, rather than a decision remade every month, is what separates businesses that actually have a reserve when they need one from those that always meant to build one.

Today's question: how do you currently decide whether this month's profit should be saved or reinvested - is it a deliberate rule, or does it depend on whatever opportunity or impulse happens to be in front of you? If it is the latter, what simple rule could you establish this month to make the decision more consistent?

We ask the questions. You write the answers, and we keep every one of them so your allocation decisions build into a consistent, reviewable pattern.` },
  { topic: 'Saving', subject: 'The cost of not saving enough', message: `Businesses rarely fail from a single catastrophic event. More often, they fail from an accumulation of ordinary setbacks - a slow month, a late-paying client, an unexpected repair - that would individually be manageable, but that become fatal in combination simply because there was no cushion available to absorb any of them.

The cost of inadequate savings is not only financial, though the financial cost is real and immediate: missed payments, damaged vendor relationships, high-interest emergency borrowing, or difficult layoff decisions made under pressure rather than through careful planning. These financial consequences often cascade, since a missed vendor payment can affect your supply reliability, which affects your ability to serve customers, which affects revenue, deepening the original problem.

The less obvious cost is decision quality. A business with no reserve making decisions under acute financial pressure tends to make worse decisions than the same business with breathing room would make facing the identical problem. Pricing decisions, staffing decisions, and even customer service decisions made from a position of financial desperation frequently prioritize immediate survival over the business's longer-term health, sometimes damaging the very relationships and reputation needed to recover.

There is also a personal cost that is easy to underestimate in advance. Running a business with inadequate reserves means living with a level of chronic stress and uncertainty that affects decision-making, health, and relationships well beyond the business itself. Owners in this position often describe making worse decisions not because they lack skill, but because they are making every decision while managing significant underlying anxiety about survival.

Opportunity cost is another frequently overlooked consequence. A business with no reserve cannot take advantage of genuine opportunities that require upfront cash - a bulk purchase discount, a chance to acquire a struggling competitor's customer list, or a sudden opening in a better location - because all available cash is already committed to simply maintaining current operations, leaving nothing available to act on a time-sensitive opportunity.

Understanding these real costs, not just in abstract terms but specifically for your own business and circumstances, can motivate the sometimes uncomfortable discipline required to build a reserve, particularly in the early stages when every dollar feels like it has an urgent, immediate use elsewhere in the business.

It is worth remembering that building a reserve is not a one-time project but an ongoing practice, revisited and protected through good months and challenging ones alike, since the temptation to skip a contribution during a tight month is exactly when the eventual protection matters most.

Financial discipline around saving is easiest to maintain in theory and hardest to maintain in practice, precisely because the moments that test it - a strong month that invites spending, or a slow month that invites skipping a contribution - are the exact moments the habit matters most. Building saving into an automatic, non-negotiable process, rather than a decision remade every month, is what separates businesses that actually have a reserve when they need one from those that always meant to build one.

Today's question: what would running out of cash actually cost you, beyond the immediate financial impact - in terms of decisions you would be forced to make, relationships that might be damaged, or stress that would affect you personally? Write down the specific scenario you are most trying to avoid.

We ask the questions. You write the answers, and we keep every one of them so this motivation stays clear even once the immediate pressure that prompted it has passed.` },
  { topic: 'Saving', subject: 'Where should your savings actually sit?', message: `Building a business reserve is only half the challenge - where that reserve is actually kept matters nearly as much, because the wrong choice can mean losing value to inflation over time, facing unnecessary delays accessing funds during a genuine emergency, or inadvertently blending reserve funds with regular operating cash in a way that makes the reserve easy to spend without noticing.

A checking account used for daily operations is usually a poor home for a reserve, specifically because its accessibility, which seems like an advantage, actually works against the reserve's purpose. When reserve funds sit in the same account as operating cash, they become indistinguishable from money available for everyday spending, making the reserve easy to erode gradually without a specific decision ever being made to do so.

A separate, dedicated savings account, ideally at a different institution than your primary operating accounts, creates a meaningful psychological and practical barrier. The extra step required to move funds back into an operating account, even if only a day's delay, is often enough to prevent casual or impulsive use of reserve funds for non-emergency purposes.

Within that separate account, it is worth considering the tradeoff between accessibility and yield. Keeping the entire reserve in a zero or low-interest account means it loses real value over time due to inflation, but it remains instantly accessible. A high-yield business savings account can offer meaningfully better returns while still providing same-day or next-day access, which is usually sufficient for genuine business emergencies that are not literally instantaneous in their cash need.

For larger reserves, particularly those built beyond the immediate three to six month target, it may be worth splitting the reserve across a highly liquid portion for immediate access and a slightly less liquid but higher-yield portion, such as a short-term certificate of deposit or money market account, for the part of the reserve less likely to be needed on short notice.

It is important to avoid the temptation to invest reserve funds in anything with meaningful risk of loss, such as stocks or higher-risk investments, regardless of how attractive the potential return looks. The entire purpose of a reserve is capital preservation and availability precisely when needed, which is often during periods of broader economic stress when risk-based investments may also be declining in value, defeating the purpose at the exact moment it matters most.

Revisiting where your reserve sits periodically, particularly as interest rates change or as your bank's offerings evolve, ensures you are not leaving meaningful, low-risk return on the table simply due to inertia, while never compromising the fundamental requirement that the funds remain safe and accessible when genuinely needed.

Financial discipline around saving is easiest to maintain in theory and hardest to maintain in practice, precisely because the moments that test it - a strong month that invites spending, or a slow month that invites skipping a contribution - are the exact moments the habit matters most. Building saving into an automatic, non-negotiable process, rather than a decision remade every month, is what separates businesses that actually have a reserve when they need one from those that always meant to build one.

Today's question: do you know exactly which account your business reserve currently sits in, how quickly you could access it in a genuine emergency, and whether it is earning any meaningful return while it waits? If you are uncertain about any part of this, what is the first step to finding out this week?

We ask the questions. You write the answers, and we keep every one of them so your reserve strategy is documented and intentional, not left to wherever the money happened to land.` }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const totalDays = 730;
  const start = new Date();
  start.setUTCHours(10, 0, 0, 0);
  if (start <= new Date()) start.setUTCDate(start.getUTCDate() + 1);

  const docs = [];
  for (let i = 0; i < totalDays; i++) {
    const sendAt = new Date(start);
    sendAt.setUTCDate(start.getUTCDate() + i);
    const template = templates[i % templates.length];
    docs.push({
      subject: template.subject,
      message: template.message,
      sendAt,
      status: 'pending'
    });
  }

  await ScheduledEmail.insertMany(docs);
  console.log(`Scheduled ${docs.length} emails from ${start.toISOString()} at 10:00 UTC daily.`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Schedule daily campaign error:', err);
  process.exit(1);
});
