<template>
  <v-app>
    <v-container>
      <v-row>
        <v-col class="text-center">
          <div class="display-1 font-weight-light">ESPs of Lucioles</div>
          <div class="body-1 font-weight-light pt-3">
            Présenté par :
            <v-chip
              class="ml-3"
              v-for="(u, index) in contributors"
              :key="index"
              >{{ u }}</v-chip
            >
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card class="pa-0">
            <v-card-title class="pb-0">
              <div class="text-center" style="width: 100%;">
                Temperature
              </div>
            </v-card-title>
            <apexchart
              ref="graph-temp"
              width="100%"
              height="250"
              type="line"
              :options="options"
              :series="series.temp"
            ></apexchart
          ></v-card>
        </v-col>
        <v-col>
          <v-card class="pa-0">
            <v-card-title class="pb-0">
              <div class="text-center" style="width: 100%;">
                Lights
              </div> </v-card-title
            ><apexchart
              ref="graph-light"
              width="100%"
              height="250"
              type="line"
              :options="options"
              :series="series.light"
            ></apexchart
          ></v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-row>
                <v-col class="py-0">
                  Liste des clients
                </v-col>
                <v-col class="text-right py-0">
                  <v-dialog v-model="dialog" persistent max-width="600px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        color="primary"
                        @click="dialog = true"
                        small
                      >
                        <v-icon left>mdi-plus</v-icon>
                        Rejoidre</v-btn
                      >
                    </template>
                    <v-card>
                      <v-card-title>
                        <span class="headline"
                          >Rejoindre la flotte d'objets
                        </span>
                      </v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col>
                            <v-text-field
                              :error-messages="inputErrors.name"
                              name="name"
                              label="Votre nom"
                              v-model="userModelForm.name"
                            ></v-text-field>
                            <v-text-field
                              :error-messages="inputErrors.mac"
                              name="name"
                              label="Votre adresse MAC"
                              v-model="userModelForm.mac"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="blue darken-1"
                          text
                          @click="
                            dialog = false;
                            userModelForm.name = '';
                            userModelForm.mac = '';
                          "
                          >Close</v-btn
                        >
                        <v-btn color="blue darken-1" text @click="addClient"
                          >Save</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>
            </v-card-title>
            <v-card-text>
              <v-data-table :headers="headers" :items="users">
                <template v-slot:item.name="{ item }">
                  <v-chip color="primary"> {{ item.name }}</v-chip>
                </template>
                <template v-slot:item.mac="{ item }">
                  <v-chip> {{ item.mac }}</v-chip>
                </template>
                <template v-slot:item.led="{ item }">
                  <v-btn
                    x-small
                    fab
                    :color="item.data.ledOn ? 'green' : 'grey'"
                  ></v-btn>
                </template>
                <template v-slot:item.temp="{ item }">
                  <v-chip v-if="item.data.temp.length <= 0"> °c</v-chip>
                  <v-chip v-else>
                    {{
                      item.data.temp[0].data[item.data.temp[0].data.length - 1]
                        .y
                    }}
                    °c
                  </v-chip>
                </template>
                <template v-slot:item.light="{ item }">
                  <v-chip v-if="item.data.light.length <= 0"></v-chip>
                  <v-chip v-else>
                    {{
                      item.data.light[0].data[
                        item.data.light[0].data.length - 1
                      ].y
                    }}
                  </v-chip>
                </template>
                <template v-slot:item.ping="{ item }">
                  <v-btn
                    :disabled="item.data.alerted"
                    color="red lighten-1"
                    class="white--text"
                    @click="alerter(item)"
                  >
                    <v-icon left small>mdi-alert</v-icon>
                    Alerter</v-btn
                  >
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-dialog
        :value="userLedOK.length > 0"
        max-width="550px"
        @close="userLedOK = []"
      >
        <v-card v-if="userLedOK">
          <v-card-text class="pa-8">
            <div class="display-2 text-center font-weight-thin">
              Bonne nouvelle !
            </div>
            <div class="body-1 text-center mt-2 px-8 py-5">
              Ces personnes que vous avez alerté vous ont répondu que tout va
              bien !
            </div>
            <div class="text-center">
              <v-chip
                class="ml-2"
                large
                v-for="(u, index) in userLedOK"
                :key="index"
                >{{ u.name }} [{{ u.mac }}]</v-chip
              >
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script>
import moment from "moment";
import ApexChart from "vue-apexcharts";
export default {
  components: {
    apexchart: ApexChart,
  },
  data() {
    return {
      contributors: [
        "Taoufik FEKIH",
        "Norman BAJAT",
        "Celine MARIN",
        "Yan FULCONIS",
        "Ines NABIL",
        "Maxime MARIAS",
      ],
      repeatInterval: null,
      dialog: false,
      created: false,
      userLedOK: [],
      loading: false,
      userModelForm: {
        name: "",
        mac: "",
        temp: 20,
        light: 1500,
        data: {
          temp: [],
          light: [],
          ledOn: false,
        },
      },
      userModel: {
        name: "",
        mac: "",
        temp: 20,
        light: 1500,
        data: {
          temp: [],
          light: [],
          ledOn: false,
        },
      },
      headers: [
        { text: "Nom", value: "name" },
        { text: "Adresse MAC", value: "mac" },
        { text: "Etat LED", value: "led" },
        { text: "Température Actuelle", value: "temp" },
        { text: "Luminosité Actuelle", value: "light" },
        { text: "Alérter", value: "ping" },
      ],
      users: [],
      series: {
        temp: [],
        light: [],
      },
      tableOptions: {
        yaxis: {
          labels: { show: false },
        },
        xaxis: {
          type: "datetime",
          labels: { show: false },
        },
        chart: {
          toolbar: {
            show: false,
          },
        },
        grid: {
          show: false,
        },
        legend: {
          show: false,
        },
      },
      options: {
        legend: {
          position: "bottom",
          horizontalAlign: "center",
        },
        stroke: {
          width: 1.5,
        },
        chart: {
          selection: {
            enabled: true,
          },
          toolbar: {
            show: true,
            autoSelected: "zoom",
          },
        },
        xaxis: {
          type: "datetime",
          labels: {
            datetimeFormatter: {
              year: "yyyy",
              month: "MMM 'yy",
              day: "HH:mm",
              hour: "HH:mm",
            },
          },
        },
      },
    };
  },
  computed: {
    inputErrors() {
      return {
        name: this.userModelForm.name.trim() == "" ? ["Le nom est requis"] : [],
        mac:
          this.userModelForm.mac.trim() == ""
            ? ["L'adresse mac est requise"]
            : [],
      };
    },
  },
  created() {
    let t = this;
    this.getClients();
    (function () {
      // do some stuff
      setInterval(t.getClients, 10000);
    })();
    (function () {
      // do some stuff
      setInterval(t.checkPingBack, 1500);
    })();
  },
  methods: {
    getAllClientsData() {
      let t = this;
      this.users.map((u, i) => {
        t.getClientData(i);
      });
    },
    addClient() {
      const form = {
        name: this.userModelForm.name,
        mac: this.userModelForm.mac,
      };
      if (this.inputErrors.name.length > 0 || this.inputErrors.mac.length > 0)
        return;
      this.$axios.post("/users", form).then((r) => {
        this.getClients();
        this.userModelForm.name = "";
        this.userModelForm.mac = "";
        this.dialog = false;
      });
    },
    checkPingBack() {
      this.$axios.get("/users").then((r) => {
        r.data.map((u) => {
          if (u.led_ok) {
            if (moment(u.led_ok).isAfter(moment().subtract(15, "seconds"))) {
              this.userLedOK.push(u);
            }
          }
          return u;
        });
      });
    },
    getClients() {
      this.$axios.get("/users").then((r) => {
        r.data.map((u) => {
          u.data = {
            temp: [],
            light: [],
            ledOn: false,
            alerted: false,
          };
          return u;
        });
        this.users = r.data;
        this.loading = false;
        this.getAllClientsData();
      });
    },
    handleUserGraph(client, data, graph) {
      this.series[graph];
      let s = {
        name: client.name,
        data: [],
      };
      data.map((o) => {
        s.data.push({
          x: o.date,
          y: o.value,
        });
      });
      let found = false;
      for (let i = 0; i < this.series[graph].length; i++) {
        const e = this.series[graph][i];
        if (e.name == client.name) {
          found = true;
          this.series[graph][i].data = s.data;
          break;
        }
      }
      if (!found) this.series[graph].push(s);
      if (this.$refs["graph-" + graph])
        this.$refs["graph-" + graph].updateSeries(this.series[graph]);
    },
    alerter(client) {
      this.$axios
        .get("/ping/" + client.mac + "/" + (client.data.ledOn ? "off" : "on"))
        .then((r) => {
          client.data.alerted = true;
          client.data.ledOn = !client.data.ledOn;
        });
    },
    getClientData(clientIndex) {
      this.$axios.get(`esp/${this.users[clientIndex].mac}/temp`).then((r) => {
        this.handleUserGraph(this.users[clientIndex], r.data, "temp");
        if (r.data.length > 0) {
          this.users[clientIndex].temp = r.data[r.data.length - 1].value;
        }
      });
      this.$axios.get(`esp/${this.users[clientIndex].mac}/light`).then((r) => {
        this.handleUserGraph(this.users[clientIndex], r.data, "light");
        if (r.data.length > 0) {
          this.users[clientIndex].light = r.data[r.data.length - 1].value;
        }
      });
    },
  },
};
</script>

<style scoped></style>
