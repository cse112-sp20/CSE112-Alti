// Helper file to store json objects for App Home

// List of times every half hour to be used in the options field of a dropdown menu select
var times = [
    {
      "text": {
        "type": "plain_text",
        "text": "12:00",
        "emoji": true
      },
      "value": "value-0"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "12:30",
            "emoji": true
        },
        "value": "value-1"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "1:00",
            "emoji": true
        },
        "value": "value-2"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "1:30",
            "emoji": true
        },
        "value": "value-3"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "2:00",
            "emoji": true
        },
        "value": "value-4"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "2:30",
            "emoji": true
        },
        "value": "value-5"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "3:00",
            "emoji": true
        },
        "value": "value-6"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "3:30",
            "emoji": true
        },
        "value": "value-7"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "4:00",
            "emoji": true
        },
        "value": "value-8"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "4:30",
            "emoji": true
        },
        "value": "value-9"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "5:00",
            "emoji": true
        },
        "value": "value-10"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "5:30",
            "emoji": true
        },
        "value": "value-11"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "6:00",
            "emoji": true
        },
        "value": "value-12"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "6:30",
            "emoji": true
        },
        "value": "value-13"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "7:00",
            "emoji": true
        },
        "value": "value-14"
    },
        {
        "text": {
            "type": "plain_text",
            "text": "7:30",
            "emoji": true
        },
        "value": "value-15"
    },
        {
        "text": {
            "type": "plain_text",
            "text": "8:00",
            "emoji": true
        },
        "value": "value-16"
    },
        {
        "text": {
            "type": "plain_text",
            "text": "8:30",
            "emoji": true
        },
        "value": "value-17"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "9:00",
            "emoji": true
        },
        "value": "value-18"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "9:30",
            "emoji": true
        },
        "value": "value-19"
    },
        {
        "text": {
            "type": "plain_text",
            "text": "10:00",
            "emoji": true
        },
        "value": "value-20"
    },
        {
        "text": {
            "type": "plain_text",
            "text": "10:30",
            "emoji": true
        },
        "value": "value-21"
    },
        {
        "text": {
            "type": "plain_text",
            "text": "11:00",
            "emoji": true
        },
        "value": "value-22"
    },
        {
        "text": {
            "type": "plain_text",
            "text": "11:30",
            "emoji": true
        },
        "value": "value-23"
    }
  ];


var ampm = 
[
    {
        "text": {
        "type": "plain_text",
        "text": "AM",
        "emoji": true
        },
        "value": "value-0"
    },
    {
        "text": {
        "type": "plain_text",
        "text": "PM",
        "emoji": true
        },
        "value": "value-1"
    }
];
  
var time_zones = 
[
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -12:00",
      "emoji": true
    },
    "value": "-12:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -11:00",
      "emoji": true
    },
    "value": "-11:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -10:00",
      "emoji": true
    },
    "value": "-10:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -09:30",
      "emoji": true
    },
    "value": "-09:30"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -09:00",
      "emoji": true
    },
    "value": "-09:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -08:00",
      "emoji": true
    },
    "value": "-08:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -07:00",
      "emoji": true
    },
    "value": "-07:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -06:00",
      "emoji": true
    },
    "value": "-06:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -05:00",
      "emoji": true
    },
    "value": "-05:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -04:00",
      "emoji": true
    },
    "value": "-04:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -03:30",
      "emoji": true
    },
    "value": "-03:30"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -03:00",
      "emoji": true
    },
    "value": "-03:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -02:00",
      "emoji": true
    },
    "value": "-02:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -01:00",
      "emoji": true
    },
    "value": "-01:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC 00:00",
      "emoji": true
    },
    "value": "00:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -12:00",
      "emoji": true
    },
    "value": "-12:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC -12:00",
      "emoji": true
    },
    "value": "-12:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +01:00",
      "emoji": true
    },
    "value": "+01:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +02:00",
      "emoji": true
    },
    "value": "+02:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +03:00",
      "emoji": true
    },
    "value": "+03:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +03:30",
      "emoji": true
    },
    "value": "+03:30"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +04:00",
      "emoji": true
    },
    "value": "+04:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +04:30",
      "emoji": true
    },
    "value": "+04:30"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +05:00",
      "emoji": true
    },
    "value": "+05:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +05:30",
      "emoji": true
    },
    "value": "+05:30"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +05:45",
      "emoji": true
    },
    "value": "+05:45"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +06:00",
      "emoji": true
    },
    "value": "+06:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +06:30",
      "emoji": true
    },
    "value": "+06:30"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +07:00",
      "emoji": true
    },
    "value": "+07:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +08:00",
      "emoji": true
    },
    "value": "+08:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +08:45",
      "emoji": true
    },
    "value": "+08:45"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +09:00",
      "emoji": true
    },
    "value": "+09:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +09:30",
      "emoji": true
    },
    "value": "+09:30"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +10:00",
      "emoji": true
    },
    "value": "+10:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +10:30",
      "emoji": true
    },
    "value": "+10:30"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +11:00",
      "emoji": true
    },
    "value": "+11:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +12:00",
      "emoji": true
    },
    "value": "+12:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +12:45",
      "emoji": true
    },
    "value": "+12:45"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +13:00",
      "emoji": true
    },
    "value": "+13:00"
  },
  {
    "text": {
      "type": "plain_text",
      "text": "UTC +14:00",
      "emoji": true
    },
    "value": "+14:00"
  }
];

monday_custom_block = 
{
  
  "type": "actions",
  "block_id": "monday_custom_block",
  "elements": [
    {
      "type": "static_select",
      "action_id": "monday_warmup_time1_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a warm up time",
        "emoji": true
      },
      "options": times
    },
    {
      "type": "static_select",
      "action_id": "monday_warmup_time2_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "AM/PM",
        "emoji": true
      },
      "options": ampm
    },
    {
      "type": "static_select",
      "action_id": "monday_cooldown_time1_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a cooldown time",
        "emoji": true
      },
      "options": times
    },
    {
      "type": "static_select",
      "action_id": "monday_cooldown_time2_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "AM/PM",
        "emoji": true
      },
      "options": ampm
    },
    {
      "type": "button",
      "action_id": "monday_set_button",
      "text": {
        "type": "plain_text",
        "text": "set",
        "emoji": true
      }
    }
  ]
};




tuesday_custom_block = 
{
  
  "type": "actions",
  "block_id": "tuesday_custom_block",
  "elements": [
    {
      "type": "static_select",
      "action_id": "tuesday_warmup_time1_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a warm up time",
        "emoji": true
      },
      "options": times
    },
    {
      "type": "static_select",
      "action_id": "tuesday_warmup_time2_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "AM/PM",
        "emoji": true
      },
      "options": ampm
    },
    {
      "type": "static_select",
      "action_id": "tuesday_cooldown_time1_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a cooldown time",
        "emoji": true
      },
      "options": times
    },
    {
      "type": "static_select",
      "action_id": "tuesday_cooldown_time2_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "AM/PM",
        "emoji": true
      },
      "options": ampm
    },
    
    {
      "type": "button",
      "action_id": "tuesday_set_button",
      "text": {
        "type": "plain_text",
        "text": "set",
        "emoji": true
      }
    }
  ]
};

wednesday_custom_block = 
{
  
  "type": "actions",
  "block_id": "wednesday_custom_block",
  "elements": [
    {
      "type": "static_select",
      "action_id": "wednesday_warmup_time1_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a warm up time",
        "emoji": true
      },
      "options": times
    },
    {
      "type": "static_select",
      "action_id": "wednesday_warmup_time2_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "AM/PM",
        "emoji": true
      },
      "options": ampm
    },
    {
      "type": "static_select",
      "action_id": "wednesday_cooldown_time1_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a cooldown time",
        "emoji": true
      },
      "options": times
    },
    {
      "type": "static_select",
      "action_id": "wednesday_cooldown_time2_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "AM/PM",
        "emoji": true
      },
      "options": ampm
    },
    
    {
      "type": "button",
      "action_id": "wednesday_set_button",
      "text": {
        "type": "plain_text",
        "text": "set",
        "emoji": true
      }
    }
  ]
};


thursday_custom_block = 
{
  
  "type": "actions",
  "block_id": "thursday_custom_block",
  "elements": [
    {
      "type": "static_select",
      "action_id": "thursday_warmup_time1_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a warm up time",
        "emoji": true
      },
      "options": times
    },
    {
      "type": "static_select",
      "action_id": "thursday_warmup_time2_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "AM/PM",
        "emoji": true
      },
      "options": ampm
    },
    {
      "type": "static_select",
      "action_id": "thursday_cooldown_time1_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a cooldown time",
        "emoji": true
      },
      "options": times
    },
    {
      "type": "static_select",
      "action_id": "thursday_cooldown_time2_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "AM/PM",
        "emoji": true
      },
      "options": ampm
    },
    
    {
      "type": "button",
      "action_id": "thursday_set_button",
      "text": {
        "type": "plain_text",
        "text": "set",
        "emoji": true
      }
    }
  ]
};

friday_custom_block = 
{
  
  "type": "actions",
  "block_id": "friday_custom_block",
  "elements": [
    {
      "type": "static_select",
      "action_id": "friday_warmup_time1_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a warm up time",
        "emoji": true
      },
      "options": times
    },
    {
      "type": "static_select",
      "action_id": "friday_warmup_time2_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "AM/PM",
        "emoji": true
      },
      "options": ampm
    },
    {
      "type": "static_select",
      "action_id": "friday_cooldown_time1_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a cooldown time",
        "emoji": true
      },
      "options": times
    },
    {
      "type": "static_select",
      "action_id": "friday_cooldown_time2_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "AM/PM",
        "emoji": true
      },
      "options": ampm
    },
    
    {
      "type": "button",
      "action_id": "friday_set_button",
      "text": {
        "type": "plain_text",
        "text": "set",
        "emoji": true
      }
    }
  ]
};


var modal = 
{
  "type": "modal",
  "callback_id": 'custom_home_schedule_modal',
  "title": {
    "type": "plain_text",
    "text": "Alti Schedule"
  },
  "blocks": [
    {
      "type": "context",
      "elements": [
				{
					"type": "mrkdwn",
					"text": "Please click set to set each individual day's work period. Notice this will override your daily warm-up and cooldown times if you have any."
				}
			]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Monday"
      },
    },
    monday_custom_block,
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Tuesday"
      },     
    },
    tuesday_custom_block,
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Wednesday"
      },
    },
    wednesday_custom_block,
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Thursday"
      },      
    },
    thursday_custom_block,
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Friday"
      },
    },
    friday_custom_block
  ],
  "close": {
    "type": "plain_text",
    "text": "Cancel"
  },
  "submit": {
    "type": "plain_text",
    "text": "Done"
  },
  "private_metadata": "Shhhhhhhh"
};

exports.times = times;
exports.ampm = ampm;
exports.time_zones = time_zones;
exports.monday_custom_block = this.monday_custom_block;
exports.tuesday_custom_block = this.tuesday_custom_block;
exports.wednesday_custom_block = this.wednesday_custom_block;
exports.thursday_custom_block = this.thursday_custom_block;
exports.friday_custom_block = this.friday_custom_block;
exports.modal = modal;