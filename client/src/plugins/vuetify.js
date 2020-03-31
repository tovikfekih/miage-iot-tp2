import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#03a9f4",
        secondary: "#3f51b5",
        accent: "#03a9f4",
        error: "#ff3737",
        warning: "#8bc34a",
        info: "#ffc107",
        success: "#ff9800"
      }
    }
  }
});
