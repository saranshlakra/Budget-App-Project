"use strict";
/* ----1--- */ let appController = (function () {
  let Expense = function (id, description, value) {
    // we use capital 'E' for expense because it is a fn constructor
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let data = {
    allItems: {
      exp: [],
      inc: [],
    },
    total: {
      inc: 0,
      exp: 0,
    },
    budget: 0,
    percentage: -1, // we use -1 to show that this value is not exist
  };
  let calcIncExp = function (type) {
    let totalIncExp = 0;
    for (let i = 0; i <= data.allItems[type].length - 1; i++) {
      totalIncExp = totalIncExp + data.allItems[type][i].value;
      console.log(data.allItems[type][i].value);
      console.log(totalIncExp);
    }
    data.total[type] = totalIncExp;
    //return totalIncExp;
  };

  let calcBudget = function () {
    data.budget = data.total.inc - data.total.exp;
    console.log(data.budget);
  };

  let calcPercentage = function () {
    if (data.total.inc > 0) {
      data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
    } else {
      data.percentage = -1;
    }
    console.log(data.percentage + "%");
  };
  return {
    addItem: function (type, description, value) {
      let newItem, id;

      //create new id
      id = 0;
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      //create new Item
      if (type === "exp") {
        newItem = new Expense(id, description, value);
      } else if (type === "inc") {
        newItem = new Income(id, description, value);
      }
      //storing Items in arrays(data)
      data.allItems[type].push(newItem);
      return newItem;
    },
    budgetCalc: function (type) {
      // type coming from calcinc from backend controller
      calcIncExp(type);
      calcBudget();
      calcPercentage();
    },

    getBudget: function () {
      return {
        budget: data.budget,
        income: data.total.inc,
        expense: data.total.exp,
        percentage: data.percentage,
      };
    },
    //just for console testing
    testing: function () {
      console.log(data);
    },
  };
})();

/* ----2---- */
let uiController = (function () {
  let DOMstrings = {
    // now whenever we want to change any class or id in html/css then we just need to change it from here not from every where because we put ( for eg. DOMstrings.inputDescription ) at all the place.
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    input_btn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    percentage1Label: ".item__percentage",
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    getDOMstrings: function () {
      // here we are just returning DOMstring to public scope so that other module can get its access.
      return DOMstrings;
    },

    addItemToList: function (obj, type, objBudget) {
      let html, newHtml, element;

      // Creating new strings with placeholder text
      if (type === "inc") {
        // ye type 'inc' hai bcuz html mein inc likhi hai iski value
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expenseContainer;
        html =
          ' <div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">#21%#</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // Replacing placeholder text with actual data
      newHtml = html.replace("%id", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);
      // newHtml = newHtml.replace("#21%#", objBudget.percentage);

      // Inserting some actual data
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    // clearing fields/placeholder(Description, Value)
    clearFields: function () {
      let fields, fieldsArray;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );
      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function (currentField) {
        currentField.value = "";
      });
      // console.log(fields);
    },
    displayBIEP: function (objBudget) {
      document.querySelector(DOMstrings.budgetLabel).textContent =
        objBudget.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent =
        objBudget.income;
      document.querySelector(DOMstrings.expenseLabel).textContent =
        objBudget.expense;
      if (objBudget.income > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          objBudget.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "....";
      }
      // document.querySelector(DOMstrings.percentage1Label).textContent =
      //   objBudget.percentage + "%";
    },
  };
})();

/* ----3---- */
let backendController = (function (appCtrl, uiCtrl) {
  // It is the module, where we tell other modules; What to do..

  let setupEventListners = function () {
    let DOM = uiCtrl.getDOMstrings();
    let clickEnter = function (event) {
      if (event.keyCode === 13 || event.which === 1) {
        getItem();
      }
    }; // press click or enter to add value to db function.

    document.querySelector(DOM.input_btn).addEventListener("click", clickEnter);
    document.addEventListener("keypress", clickEnter);
  };

  let updateBudget = function (gettype) {
    appController.budgetCalc(gettype); //1 calculate budget

    var finalBudget = appController.getBudget(); //2 get budget

    uiController.displayBIEP(finalBudget); //3 display budget
  };

  let getItem = function () {
    var input, newItem;
    input = uiCtrl.getInput();
    console.log(input); // only for testing purpose
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = appController.addItem(
        input.type,
        input.description,
        input.value
      );
      console.log(input.type); // only for testing purpose
      console.log(newItem);
      // console.log(percentage);
      var finalBudget = appController.getBudget(); //2 get budget

      uiController.addItemToList(newItem, input.type, finalBudget);
      uiController.clearFields();
      updateBudget(input.type);
    }
  };

  return {
    init: function () {
      console.log("HELLO FRIENDS");
      // clickEnter;
      setupEventListners();
    },
  };
})(appController, uiController);

backendController.init();
