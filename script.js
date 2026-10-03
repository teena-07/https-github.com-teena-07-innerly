// =====================================================
// INNERLY - ASSESSMENTS + CUSTOMER QUESTIONNAIRE
const INNERLY_SCRIPT_URL =
 "https://script.google.com/macros/s/AKfycbzLcQlY0IqPYwO8CN5TQ1QfVOz74V7FH1FzYdVhTBnlM-vmzJwPOh0FRX19WDVHDw/exec";// =====================================================

// =====================================================
// INNERLY — RAZORPAY PAYMENT
// =====================================================

const INNERLY_API_URL =
  "https://https-githubcom-teena-07-innerly.vercel.app";

const INNERLY_RAZORPAY_KEY_ID =
  "rzp_test_TjRoOWD0Qyx9fh";

const INNERLY_PRODUCTS = {
  self_reflection: {
    name: "Personalized Self-Reflection Report",
    amount: 199
  },

  overthinking_reset: {
    name: "7-Day Overthinking Reset",
    amount: 149
  },

  relationship_report: {
    name: "Relationship Pattern Report",
    amount: 299
  }
};

  // =====================================================
// START RAZORPAY PAYMENT
// =====================================================

async function startPayment(productKey) {
  try {
    const product = INNERLY_PRODUCTS[productKey];

    if (!product) {
      alert("Product not found.");
      return;
    }

    // Create Razorpay order
    const response = await fetch(
      `${INNERLY_API_URL}/api/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product: productKey
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to create payment order."
      );
    }

    const order = data.order;

    // Open Razorpay Checkout
    const options = {
      key: INNERLY_RAZORPAY_KEY_ID,

      amount: order.amount,
      currency: "INR",

      name: "Innerly",

      description: product.name,

      order_id: order.id,

      prefill: {
        name: "",
        email: "",
        contact: ""
      },

      theme: {
        color: "#7c3aed"
      },

      handler: async function (paymentResponse) {

        try {

          // Verify payment on server
          const verifyResponse = await fetch(
            `${INNERLY_API_URL}/api/verify-payment`,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json"
              },

              body: JSON.stringify({
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature
              })
            }
          );

          const verification =
            await verifyResponse.json();

          if (
            !verifyResponse.ok ||
            !verification.success
          ) {
            alert(
              "Payment verification failed. Please contact Innerly support."
            );
            return;
          }

          // Save payment information
          localStorage.setItem(
            "innerlyPayment",
            JSON.stringify({
              product: productKey,
              productName: product.name,
              amount: product.amount,
              orderId:
                paymentResponse.razorpay_order_id,
              paymentId:
                paymentResponse.razorpay_payment_id,
              paymentStatus: "Paid",
              paidAt: new Date().toISOString()
            })
          );

          // Continue to existing Innerly form
          openPersonalReport();

        } catch (error) {

          console.error(
            "Payment verification error:",
            error
          );

          alert(
            "We could not verify your payment. Please contact Innerly support."
          );
        }
      },

      modal: {
        ondismiss: function () {
          console.log(
            "Razorpay payment window closed."
          );
        }
      }
    };

    const razorpay =
      new Razorpay(options);

    razorpay.open();

  } catch (error) {

    console.error(
      "Razorpay payment error:",
      error
    );

    alert(
      error.message ||
      "Unable to start payment. Please try again."
    );
  }
}
const assessments = {


 overthinking: {
   title: "Overthinking Patterns",
   description: "Reflect on how often repetitive thinking shows up in your everyday life.",
   questions: [
     "How often do you find yourself thinking about the same situation again and again?",
     "How often do you replay past conversations in your mind?",
     "How often do you imagine negative outcomes before something happens?",
     "How difficult is it for you to stop thinking about something once it starts?",
     "How often do small problems stay on your mind for a long time?",
     "How often do you find yourself asking 'what if' questions repeatedly?",
     "How often does overthinking make it difficult to focus on the present?",
     "How often do you struggle to relax because your mind feels busy?"
   ]
 },


 boundaries: {
   title: "Boundaries & Communication",
   description: "Reflect on how you communicate your needs and limits.",
   questions: [
     "How comfortable are you saying no when you do not want to do something?",
     "How often do you agree to things even when you do not really want to?",
     "How comfortable are you telling someone when they have crossed a boundary?",
     "How often do you worry that saying no will upset someone?",
     "How comfortable are you asking for personal space?",
     "How often do you put another person's needs before your own?",
     "How comfortable are you expressing your needs clearly?",
     "How often do you feel guilty after setting a boundary?"
   ]
 },


 confidence: {
   title: "Confidence & Self-Belief",
   description: "Reflect on how you experience confidence in everyday situations.",
   questions: [
     "How comfortable are you sharing your opinions with others?",
     "How often do you doubt your own decisions?",
     "How comfortable are you trying something unfamiliar?",
     "How often do you compare yourself with other people?",
     "How comfortable are you accepting compliments?",
     "How often do you worry about what others think of you?",
     "How comfortable are you acknowledging your own achievements?",
     "How often do you avoid opportunities because you feel you may not be good enough?"
   ]
 },


 relationship: {
   title: "Relationship Communication",
   description: "Reflect on communication patterns that may appear in your relationships.",
   questions: [
     "How comfortable are you expressing your feelings to someone close to you?",
     "How often do you keep your feelings to yourself to avoid conflict?",
     "How comfortable are you discussing disagreements openly?",
     "How often do you assume what another person is thinking without asking?",
     "How comfortable are you asking for reassurance when you need it?",
     "How often do misunderstandings remain unresolved?",
     "How comfortable are you listening when someone disagrees with you?",
     "How often do you find yourself overanalysing messages or conversations?"
   ]
 }


};




// =====================================================
// GLOBAL STATE
// =====================================================


let currentAssessment = null;
let currentQuestion = 0;
let answers = [];




// =====================================================
// DOM ELEMENTS
// =====================================================


const assessmentModal = document.getElementById("assessmentModal");
const productModal = document.getElementById("productModal");




// =====================================================
// START ASSESSMENT
// =====================================================


function startAssessment(type) {


 if (!assessments[type]) {
   console.error("Assessment not found:", type);
   return;
 }


 currentAssessment = type;
 currentQuestion = 0;


 answers = new Array(
   assessments[type].questions.length
 ).fill(null);


 if (assessmentModal) {
   assessmentModal.classList.add("active");
   assessmentModal.setAttribute("aria-hidden", "false");
 }


 renderQuestion();
}




// =====================================================
// RENDER QUESTION
// =====================================================


function renderQuestion() {


 if (!currentAssessment) return;


 const assessment = assessments[currentAssessment];
 const question = assessment.questions[currentQuestion];


 const total = assessment.questions.length;


 const questionNumber =
   document.getElementById("questionNumber");


 const questionText =
   document.getElementById("questionText");


 const answerOptions =
   document.getElementById("answerOptions");


 const progressFill =
   document.getElementById("progressFill");


 if (!questionNumber || !questionText || !answerOptions) {
   console.error("Assessment HTML elements are missing.");
   return;
 }


 questionNumber.textContent =
   `Question ${currentQuestion + 1} of ${total}`;


 questionText.textContent = question;


 answerOptions.innerHTML = "";


 const options = [
   {
     value: 0,
     label: "Never"
   },
   {
     value: 1,
     label: "Rarely"
   },
   {
     value: 2,
     label: "Sometimes"
   },
   {
     value: 3,
     label: "Often"
   },
   {
     value: 4,
     label: "Almost always"
   }
 ];


 options.forEach(option => {


   const button = document.createElement("button");


   button.type = "button";
   button.className = "answer-option";


   button.textContent = option.label;


   if (answers[currentQuestion] === option.value) {
     button.classList.add("selected");
   }


   button.addEventListener("click", () => {


     answers[currentQuestion] = option.value;


     document
       .querySelectorAll(".answer-option")
       .forEach(btn => btn.classList.remove("selected"));


     button.classList.add("selected");


   });


   answerOptions.appendChild(button);


 });


 if (progressFill) {


   const percentage =
     ((currentQuestion + 1) / total) * 100;


   progressFill.style.width =
     `${percentage}%`;


 }


 const previousButton =
   document.getElementById("previousQuestion");


 const nextButton =
   document.getElementById("nextQuestion");


 if (previousButton) {
   previousButton.style.visibility =
     currentQuestion === 0 ? "hidden" : "visible";
 }


 if (nextButton) {


   nextButton.textContent =
     currentQuestion === total - 1
       ? "See My Result"
       : "Next →";


 }


}




// =====================================================
// NEXT QUESTION
// =====================================================


function nextQuestion() {


 if (answers[currentQuestion] === null) {


   alert("Please select an answer before continuing.");


   return;


 }


 const total =
   assessments[currentAssessment].questions.length;


 if (currentQuestion < total - 1) {


   currentQuestion++;


   renderQuestion();


 } else {


   showAssessmentResult();


 }


}




// =====================================================
// PREVIOUS QUESTION
// =====================================================


function previousQuestion() {


 if (currentQuestion > 0) {


   currentQuestion--;


   renderQuestion();


 }


}




// =====================================================
// RESULT
// =====================================================


function showAssessmentResult() {


 const total =
   assessments[currentAssessment].questions.length;


 const score =
   answers.reduce((sum, value) => sum + value, 0);


 const maximum =
   total * 4;


 const percentage =
   Math.round((score / maximum) * 100);


 let level;
 let description;


 if (percentage <= 25) {


   level = "Lower pattern visibility";


   description =
     "Your responses suggest that this pattern may not be strongly visible in your current everyday experiences. Continue noticing what situations bring out different reactions in you.";


 } else if (percentage <= 50) {


   level = "Some pattern visibility";


   description =
     "Your responses suggest that some of these patterns may appear from time to time. Noticing when they happen can help you understand yourself better.";


 } else if (percentage <= 75) {


   level = "Noticeable pattern";


   description =
     "Your responses suggest that several of these patterns may show up fairly regularly. Reflection on triggers, thoughts and responses may be useful.";


 } else {


   level = "Strong pattern visibility";


   description =
     "Your responses suggest that many of these patterns are frequently present in your current experiences. A deeper self-reflection exercise may help you explore them further.";


 }




 // Save latest result only
 localStorage.setItem(
   "innerlyLastAssessment",
   JSON.stringify({
     type: currentAssessment,
     score,
     percentage,
     level,
     answers: [...answers],
     date: new Date().toISOString()
   })
 );




 const assessmentContent =
   document.getElementById("assessmentContent");


 if (!assessmentContent) return;




 assessmentContent.innerHTML = `


   <div class="assessment-result">


     <div class="result-icon">
       ✨
     </div>


     <h2>
       Your Reflection Result
     </h2>


     <p class="result-score">
       ${level}
     </p>


     <p>
       You scored
       <strong>${percentage}%</strong>
       on this self-reflection exercise.
     </p>


     <p class="result-text">
       ${description}
     </p>


     <p class="result-text">


       This result is for self-reflection only.
       It is not a psychological diagnosis or
       clinical assessment.


     </p>




     <button
       type="button"
       class="btn btn-primary btn-full"
       onclick="retakeAssessment()"
     >
       🔄 Retake Assessment
     </button>




     <button
       type="button"
       class="btn btn-secondary btn-full"
       style="margin-top:10px;"
       onclick="openPersonalReport()"
     >
       Explore My Personalized Report →
     </button>




     <button
       type="button"
       class="btn btn-secondary btn-full"
       style="margin-top:10px;"
       onclick="closeAssessment()"
     >
       Back to Innerly
     </button>


   </div>


 `;


}
function retakeAssessment() {


 if (!currentAssessment) return;


 // Completely reset the current test
 currentQuestion = 0;


 answers =
   new Array(
     assessments[currentAssessment].questions.length
   ).fill(null);


 // Rebuild the assessment screen
 const assessmentContent =
   document.getElementById("assessmentContent");


 if (!assessmentContent) return;


 assessmentContent.innerHTML = `


   <div class="modal-title">
     <h2>
       ${assessments[currentAssessment].title}
     </h2>
   </div>


   <p class="modal-subtitle">
     ${assessments[currentAssessment].description}
   </p>


   <div class="progress-wrapper">


     <div class="progress-bar">


       <div
         class="progress-fill"
         id="progressFill"
       ></div>


     </div>


   </div>


   <div
     class="question-number"
     id="questionNumber"
   >
     Question 1 of 8
   </div>


   <div
     class="question-text"
     id="questionText"
   ></div>


   <div
     class="answer-options"
     id="answerOptions"
   ></div>


   <div class="assessment-controls">


     <button
       type="button"
       class="btn btn-secondary"
       id="previousQuestion"
       onclick="previousQuestion()"
     >
       ← Previous
     </button>


     <button
       type="button"
       class="btn btn-primary"
       id="nextQuestion"
       onclick="nextQuestion()"
     >
       Next →
     </button>


   </div>


 `;


 renderQuestion();


}




// =====================================================
// PERSONAL REPORT FORM
// =====================================================


function openPersonalReport() {


 closeAssessment();


 if (!productModal) return;


 productModal.classList.add("active");
 productModal.setAttribute("aria-hidden", "false");


 const productContent =
   document.getElementById("productContent");


 if (!productContent) return;


 productContent.innerHTML = `


   <div>


     <h2 class="modal-title">
       Get Your Personalized Innerly Report
     </h2>


     <p class="modal-subtitle">
       Tell us a little about yourself so we can prepare
       a more personalized self-reflection report.
     </p>


     <form id="personalReportForm">


       <div class="form-group">


         <label for="customerName">
           Your Name
         </label>


         <input
           id="customerName"
           name="name"
           type="text"
           placeholder="Enter your name"
           required
         >


       </div>




       <div class="form-group">


         <label for="customerEmail">
           Email Address
         </label>


         <input
           id="customerEmail"
           name="email"
           type="email"
           placeholder="you@example.com"
           required
         >


       </div>




       <div class="form-group">


         <label for="customerPhone">
           WhatsApp Number
         </label>


         <input
           id="customerPhone"
           name="phone"
           type="tel"
           placeholder="+91 XXXXX XXXXX"
           required
         >


       </div>




       <div class="form-group">


         <label for="mainConcern">
           What would you like to understand better?
         </label>


         <textarea
           id="mainConcern"
           name="concern"
           rows="4"
           placeholder="For example: I want to understand why I overthink certain situations..."
           required
         ></textarea>


       </div>




       <div class="form-group">


         <label for="lifeArea">
           Which area feels most relevant right now?
         </label>


         <select
           id="lifeArea"
           name="lifeArea"
           required
         >


           <option value="">
             Select one
           </option>


           <option value="self">
             Understanding myself
           </option>


           <option value="relationships">
             Relationships
           </option>


           <option value="confidence">
             Confidence
           </option>


           <option value="overthinking">
             Overthinking
           </option>


           <option value="boundaries">
             Boundaries
           </option>


           <option value="communication">
             Communication
           </option>


           <option value="other">
             Something else
           </option>


         </select>


       </div>




       <div class="form-group">


         <label for="goal">
           What would you like to improve?
         </label>


         <textarea
           id="goal"
           name="goal"
           rows="4"
           placeholder="Tell us what you would like to understand, change or improve."
           required
         ></textarea>


       </div>




       <button
         type="submit"
         class="btn btn-primary btn-full"
       >
         Continue →
       </button>


     </form>


   </div>


 `;




 const form =
   document.getElementById("personalReportForm");


 form.addEventListener("submit", handlePersonalReport);


}




// =====================================================
// HANDLE PERSONAL REPORT FORM
// =====================================================


function handlePersonalReport(event) {


 event.preventDefault();


 const formData =
   new FormData(event.target);


 const customer = {


   name: formData.get("name"),


   email: formData.get("email"),


   phone: formData.get("phone"),


   concern: formData.get("concern"),


   lifeArea: formData.get("lifeArea"),


   goal: formData.get("goal"),


   assessment:
     currentAssessment,


   assessmentResult:
     JSON.parse(
       localStorage.getItem(
         "innerlyLastAssessment"
       )
     ),


   createdAt:
     new Date().toISOString()


 };




 localStorage.setItem(
   "innerlyCustomer",
   JSON.stringify(customer)
 );




 showDetailedQuestionnaire(customer);


}




// =====================================================
// DETAILED QUESTIONNAIRE
// =====================================================


function showDetailedQuestionnaire(customer) {


 const productContent =
   document.getElementById("productContent");


 if (!productContent) return;




 productContent.innerHTML = `


   <div>


     <h2 class="modal-title">
       One More Step 🌱
     </h2>


     <p class="modal-subtitle">
       These questions help us understand your
       situation in more detail.
     </p>




     <form id="detailedQuestionnaire">




       <div class="form-group">


         <label>
           1. When did you first notice this pattern?
         </label>


         <textarea
           name="history"
           rows="4"
           placeholder="Tell us briefly..."
           required
         ></textarea>


       </div>




       <div class="form-group">


         <label>
           2. What situations usually trigger it?
         </label>


         <textarea
           name="triggers"
           rows="4"
           placeholder="Describe the situations..."
           required
         ></textarea>


       </div>




       <div class="form-group">


         <label>
           3. What do you usually think or feel in those moments?
         </label>


         <textarea
           name="thoughts"
           rows="4"
           placeholder="Write whatever comes to mind..."
           required
         ></textarea>


       </div>




       <div class="form-group">


         <label>
           4. How do you usually respond?
         </label>


         <textarea
           name="response"
           rows="4"
           placeholder="What do you normally do?"
           required
         ></textarea>


       </div>




       <div class="form-group">


         <label>
           5. How does this affect your everyday life?
         </label>


         <textarea
           name="impact"
           rows="4"
           placeholder="Work, studies, relationships, routine, etc."
           required
         ></textarea>


       </div>




       <div class="form-group">


         <label>
           6. What would you ideally like to change?
         </label>


         <textarea
           name="desiredChange"
           rows="4"
           placeholder="What would improvement look like for you?"
           required
         ></textarea>


       </div>




       <div class="form-group">


         <label>
           7. Is there anything else you want Innerly to know?
         </label>


         <textarea
           name="additional"
           rows="4"
           placeholder="Optional"
         ></textarea>


       </div>




       <button
         type="submit"
         class="btn btn-primary btn-full"
       >
         Save My Responses →
       </button>




     </form>


   </div>


 `;




 document
   .getElementById("detailedQuestionnaire")
   .addEventListener(
     "submit",
     saveDetailedQuestionnaire
   );


}




// =====================================================
// SAVE QUESTIONNAIRE
// =====================================================


function saveDetailedQuestionnaire(event) {


 event.preventDefault();


 const formData =
   new FormData(event.target);




 const questionnaire = {


   history:
     formData.get("history"),


   triggers:
     formData.get("triggers"),


   thoughts:
     formData.get("thoughts"),


   response:
     formData.get("response"),


   impact:
     formData.get("impact"),


   desiredChange:
     formData.get("desiredChange"),


   additional:
     formData.get("additional"),


   completedAt:
     new Date().toISOString()


 };




 const customer =
   JSON.parse(
     localStorage.getItem(
       "innerlyCustomer"
     )
   ) || {};




 customer.questionnaire =
   questionnaire;




 // Get the latest assessment result
 const assessmentResult =
   JSON.parse(
     localStorage.getItem(
       "innerlyLastAssessment"
     )
   ) || {};




 // Save score and level into customer data
 customer.score =
   assessmentResult.score || "";


 customer.percentage =
   assessmentResult.percentage || "";


 customer.level =
   assessmentResult.level || "";




 localStorage.setItem(
   "innerlyCustomer",
   JSON.stringify(customer)
 );




 // Send customer response to Google Sheet
 const payload = {


   name:
     customer.name || "",


   email:
     customer.email || "",


   phone:
     customer.phone || "",


   assessment:
     customer.assessment || "",


   score:
     customer.score || "",


   level:
     customer.level || "",


   concern:
     customer.concern || "",


   lifeArea:
     customer.lifeArea || "",


   goal:
     customer.goal || "",


   detailedResponses:
     customer.questionnaire || {},


   status:
     "New"


 };




 fetch(INNERLY_SCRIPT_URL, {


   method: "POST",


   headers: {
     "Content-Type":
       "text/plain;charset=utf-8"
   },


   body:
     JSON.stringify(payload)


 })


 .then(() => {


   console.log(
     "✅ Innerly response sent to Google Sheet"
   );


 })


 .catch((error) => {


   console.error(
     "❌ Google Sheet submission failed:",
     error
   );


 });




 showSuccessScreen();


}


// =====================================================
// SUCCESS SCREEN
// =====================================================


function showSuccessScreen() {


 const productContent =
   document.getElementById("productContent");


 if (!productContent) return;




 productContent.innerHTML = `


   <div class="assessment-result">


     <div class="result-icon">
      
     </div>


     <h2>
       You're All Set!
     </h2>


     <p class="result-text">


       Your reflection responses have been saved
       on this device.


     </p>


     <p class="result-text">


       The next step will be connecting Innerly
       to secure payment and report delivery.


     </p>


     <button
       class="btn btn-primary btn-full"
       onclick="closeProductModal()"
     >
       Back to Innerly
     </button>


   </div>


 `;


}




// =====================================================
// CLOSE ASSESSMENT
// =====================================================


function closeAssessment() {


 if (!assessmentModal) return;


 assessmentModal.classList.remove("active");


 assessmentModal.setAttribute(
   "aria-hidden",
   "true"
 );


}




// =====================================================
// CLOSE PRODUCT MODAL
// =====================================================


function closeProductModal() {


 if (!productModal) return;


 productModal.classList.remove("active");


 productModal.setAttribute(
   "aria-hidden",
   "true"
 );


}




// =====================================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// =====================================================


window.addEventListener("click", function(event) {


 if (
   event.target === assessmentModal
 ) {


   closeAssessment();


 }


 if (
   event.target === productModal
 ) {


   closeProductModal();


 }


});




// =====================================================
// ESC KEY
// =====================================================


document.addEventListener(
 "keydown",
 function(event) {


   if (event.key === "Escape") {


     closeAssessment();
     closeProductModal();


   }


 }
);




// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================


window.retakeAssessment =
 retakeAssessment;
 window.nextQuestion =
 nextQuestion;


window.previousQuestion =
 previousQuestion;


window.closeAssessment =
 closeAssessment;


window.closeProductModal =
 closeProductModal;


window.openPersonalReport =
 openPersonalReport;

 window.startPayment = startPayment;