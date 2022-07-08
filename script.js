"use strict";

/////////////////////////////////////////////////
// Data
const account1 = {
  owner: "Arjun Suresh",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Deepak Kumar",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Nikhil Das",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sachin Mittal",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const account5 = {
  owner: "Rahul Chauhan",
  movements: [100, 1234, 493, -110, -90, 10000],
  interestRate: 2.7,
  pin: 4343,
};

const accounts = [account1, account2, account3, account4, account5];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">₹${mov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// To display the final amount in the account on the top right corner.
// it also add a key(balance) in object
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `₹${acc.balance}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `₹${incomes}`;

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `₹${Math.abs(out)}`;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `₹${interest}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call print the remaining time into the UI
    labelTimer.textContent = `${min}:${sec}`;

    //when it reaches 0 seconds, stop the timer and logout the user.
    if (time == 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }
    //decrease timer by 1 sec
    time--;
  };
  //start of time 2 minutes
  let time = 120;

  //call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

btnLogin.addEventListener("click", function (e) {
  // Prevent form from auto-submitting
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    //inputLoginPin.blur();

    // delete any timer if present so as alternating timer bug doens't persist
    if (timer) clearInterval(timer);

    timer = startLogoutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener("click", function (e) {
  // To prevent unedded loading
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );

  //to clear the transfer money fields after one successfull transaction
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);

    // Reset Timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

// Loan is provided iff there is atleast 1 deposit of atleast 10% of loan amount
btnLoan.addEventListener("click", function (e) {
  e.preventDefault(); // to prevent default loading

  const amount = Number(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1) // some methods return true if the condn is satisified by any element in the array.
  ) {
    setTimeout(function () {
      // Add movement coz loan was approved
      currentAccount.movements.push(amount);

      // Update UI
      updateUI(currentAccount);

      // Reset Timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = "";
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// ///////////////////////////////////////
// // Array Methods Practice

// // 1.
// const bankDepositSum = accounts
//   .flatMap((acc) => acc.movements)
//   .filter((mov) => mov > 0)
//   .reduce((sum, cur) => sum + cur, 0);

// console.log(bankDepositSum);

// // 2.
// // const numDeposits1000 = accounts
// //   .flatMap(acc => acc.movements)
// //   .filter(mov => mov >= 1000).length;

// const numDeposits1000 = accounts
//   .flatMap((acc) => acc.movements)
//   .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);

// console.log(numDeposits1000);

// // Prefixed ++ oeprator
// let a = 10;
// console.log(++a);
// console.log(a);

// // 3.
// const { deposits, withdrawals } = accounts
//   .flatMap((acc) => acc.movements)
//   .reduce(
//     (sums, cur) => {
//       // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
//       sums[cur > 0 ? "deposits" : "withdrawals"] += cur;
//       return sums;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );

// console.log(deposits, withdrawals);

// // 4.
// // this is a nice title -> This Is a Nice Title
// const convertTitleCase = function (title) {
//   const capitzalize = (str) => str[0].toUpperCase() + str.slice(1);

//   const exceptions = ["a", "an", "and", "the", "but", "or", "on", "in", "with"];

//   const titleCase = title
//     .toLowerCase()
//     .split(" ")
//     .map((word) => (exceptions.includes(word) ? word : capitzalize(word)))
//     .join(" ");

//   return capitzalize(titleCase);
// };

// console.log(convertTitleCase("this is a nice title"));
// console.log(convertTitleCase("this is a LONG title but not too long"));
// console.log(convertTitleCase("and here is another title with an EXAMPLE"));

// Some features i am thinking of adding
/*    1. if loan is not approaved, display the message.
      2. display the loan condition. 10% of any deposit
      3. while logging in if no user exisst by name display the message.
      4. numorous time wrongly attempted to login, either lock the account, or dsiplay the message that owner of the      account has been alerted.
      5. loan will only be approaved if the user has no pre-existing loan. 
      6. create a Master bank account for all loan related activity.
      7. what will happen if we tranfer money when the balance is insufficient.
      8. after logging out the user we can display a message saying session timed out and stuff.
      9. Display something on successfull transections
 */
