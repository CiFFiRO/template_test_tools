module.exports = class Validator {
    static email(email) {
      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    static nickname(nickname) {
      let nicknameRegExp = /^[A-Za-z0-9]{5,}$/;
      return nicknameRegExp.test(nickname);
    }

    static password(password) {
      let passwordRegExp = /^[A-Za-z0-9]{6,}$/;
      return passwordRegExp.test(password);
    }

    static name(name) {
      let namesRegExp = /^([А-Яа-я]{2,}|[A-Za-z]{2,})$/;
      return namesRegExp.test(name);
    }

    static registrationForm(form) {
      let properties = ['email', 'nickname', 'password', 'firstName', 'secondName'];
      for (let i = 0; i < properties.length; ++i) {
        if (!form.hasOwnProperty(properties[i])) {
          return false;
        }
      }

      if (!Validator.email(form.email) || !Validator.nickname(form.nickname) || !Validator.password(form.password) ||
        !Validator.name(form.firstName) || !Validator.name(form.secondName)) {
        return false;
      }

      return true;
    }
}
