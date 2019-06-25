const ORDER_STRONG_TYPE = 0;
const ORDER_RANDOM_TYPE = 1;

class TemplateTestInternal {
  constructor() {
    this.title = '';
    this.orderType = -1;
    this.arrayTTT = [];
  }

  setTitle(title) {
    if (typeof title === 'string') {
      this.title = title;
    } else {
      throw new Error('TemplateTestInternal:setTitle argument is not a string');
    }
  }

  setOrderType(type) {
    if (typeof type !== 'number') {
      throw new Error('TemplateTestInternal:setOrderType argument is not a number');
    }
    if (type !== ORDER_STRONG_TYPE && type !== ORDER_RANDOM_TYPE) {
      throw new Error('TemplateTestInternal:setOrderType type doesn\'t exist');
    }

    this.orderType = type;
  }

  addTTT(ttt, title) {
    const translator = require('../tools/translator/translator');

    try {
      translator.checkTTT(ttt);
    }
    catch (error) {
      DEBUG(error);
      throw new Error('TemplateTestInternal:addTTT try add not correct TTT');
    }

    this.arrayTTT.push({title: title, ttt:ttt});
  }

  removeTTT(tttIndex) {
    if (tttIndex < 0 || tttIndex >= this.arrayTTT.length) {
      throw new Error('TemplateTestInternal:removeTTT bad index.');
    }

    this.arrayTTT.splice(tttIndex, 1);
  }

  toJson() {
    let json = {title: this.title, orderType: this.orderType, arrayTTT: this.arrayTTT};
    return JSON.stringify(json);
  }

  generateGIFT() {
    if (this.orderType === -1) {
      throw new Error('TemplateTestInternal:generateGIFT order type not set');
    }

    const translator = require('../tools/translator/translator');

    let tasks = [];
    for (let i=0;i<this.arrayTTT.length;++i) {
      tasks.push(translator.generateTestTaskFromTTT(this.arrayTTT[i].ttt));
    }

    if (this.orderType === ORDER_RANDOM_TYPE) {
      function rSubArray(array, length) {
        function getRandomInt(min, max) {
          return Math.floor(Math.random() * (max - min)) + min;
        }

        let result = [];
        let copy = array.slice(0);
        for (let _ = 0;_ < length;++_) {
          if (copy.length === 0) {
            break;
          }
          let i = getRandomInt(0, copy.length);
          result.push(copy[i]);
          copy.splice(i, 1);
        }
        return result;
      }

      tasks = rSubArray(tasks, tasks.length);
    }

    return translator.translateTestToGIFT(tasks);
  }
}