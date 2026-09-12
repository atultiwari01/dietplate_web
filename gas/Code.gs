/**
 * DailyPlate - Google Apps Script Backend & Google Sheets Database Engine
 * 
 * Instructions:
 * 1. Open Google Sheets (sheets.new)
 * 2. Click Extensions > Apps Script
 * 3. Replace all code with this Code.gs file
 * 4. Click Deploy > New Deployment > Web app
 *    - Description: DailyPlate Backend API
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click Deploy, Authorize access, and copy the Web App URL (ends in /exec)
 * 6. Paste the URL into DailyPlate Settings > Google Sheets Connection.
 */

// Spreadsheet Tab Names
var SHEETS = {
  PROFILE: 'User Profile',
  MEALS: 'Meals',
  TRACKING: 'Meal Tracking',
  WEIGHT: 'Weight History',
  DAILY_STATS: 'Daily Statistics'
};

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var action = params.action || 'PING';
    var responseData = {};

    ensureSheetsExist();

    switch (action) {
      case 'PING':
        responseData = { status: 'success', message: 'DailyPlate Google Apps Script API is active and ready!' };
        break;

      case 'GET_PROFILE':
        responseData = { status: 'success', data: getProfile() };
        break;

      case 'GET_MEALS':
        var date = params.date;
        var startDate = params.startDate;
        var endDate = params.endDate;
        responseData = { status: 'success', data: getMeals(date, startDate, endDate) };
        break;

      case 'GET_WEIGHT_HISTORY':
        responseData = { status: 'success', data: getWeightHistory() };
        break;

      case 'GET_DAILY_STATISTICS':
        responseData = { status: 'success', data: getDailyStatistics() };
        break;

      case 'GET_ALL_DATA':
        responseData = {
          status: 'success',
          data: {
            profile: getProfile(),
            meals: getMeals(),
            weightHistory: getWeightHistory(),
            dailyStatistics: getDailyStatistics()
          }
        };
        break;

      default:
        responseData = { status: 'error', message: 'Unknown action: ' + action };
        break;
    }

    return createJsonResponse(responseData);
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    ensureSheetsExist();

    var postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        postData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    var action = postData.action || (e && e.parameter ? e.parameter.action : '');
    var payload = postData.payload || postData;
    var responseData = {};

    switch (action) {
      case 'SETUP_DATABASE':
        setupInitialDatabase();
        responseData = { status: 'success', message: 'DailyPlate database sheets initialized successfully' };
        break;

      case 'UPDATE_PROFILE':
        var updatedProfile = updateProfile(payload);
        responseData = { status: 'success', data: updatedProfile };
        break;

      case 'CREATE_MEAL':
        var newMeal = createMeal(payload);
        responseData = { status: 'success', data: newMeal };
        break;

      case 'UPDATE_MEAL':
        var updatedMeal = updateMeal(payload);
        responseData = { status: 'success', data: updatedMeal };
        break;

      case 'DELETE_MEAL':
        var deletedId = deleteMeal(payload.mealId || payload.meal_id);
        responseData = { status: 'success', data: { mealId: deletedId } };
        break;

      case 'COMPLETE_MEAL':
        var completed = completeMeal(payload.mealId || payload.meal_id, payload.actualCompletionTime || payload.actual_completion_time);
        responseData = { status: 'success', data: completed };
        break;

      case 'MISS_MEAL':
        var missed = missMeal(payload.mealId || payload.meal_id);
        responseData = { status: 'success', data: missed };
        break;

      case 'UPDATE_WEIGHT':
        var weightRec = updateWeight(payload.weight, payload.date, payload.source);
        responseData = { status: 'success', data: weightRec };
        break;

      default:
        responseData = { status: 'error', message: 'Unknown POST action: ' + action };
        break;
    }

    return createJsonResponse(responseData);
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Returns a standardized JSON TextOutput with CORS headers
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------
// Database Operations (Google Sheets Native Integration)
// -------------------------------------------------------------

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function ensureSheetsExist() {
  var ss = getSpreadsheet();
  
  var configs = [
    { name: SHEETS.PROFILE, headers: ['user_id', 'name', 'age', 'gender', 'height', 'height_unit', 'current_weight', 'weight_unit', 'punctuality_window', 'onboarding_done'] },
    { name: SHEETS.MEALS, headers: ['meal_id', 'user_id', 'date', 'scheduled_time', 'meal_name', 'calories', 'notes', 'image_url'] },
    { name: SHEETS.TRACKING, headers: ['tracking_id', 'meal_id', 'status', 'actual_completion_time'] },
    { name: SHEETS.WEIGHT, headers: ['date', 'weight', 'source'] },
    { name: SHEETS.DAILY_STATS, headers: ['date', 'planned_meals', 'completed_meals', 'missed_meals', 'adherence', 'on_time_meals', 'punctuality'] }
  ];

  for (var i = 0; i < configs.length; i++) {
    var config = configs[i];
    var sheet = ss.getSheetByName(config.name);
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
      sheet.appendRow(config.headers);
      sheet.getRange(1, 1, 1, config.headers.length)
        .setBackground('#206140')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
}

function setupInitialDatabase() {
  ensureSheetsExist();
  var profile = getProfile();
  if (!profile || !profile.userId) {
    updateProfile({
      userId: 'usr_sarah_01',
      name: 'Sarah',
      age: 22,
      gender: 'female',
      height: 165,
      heightUnit: 'cm',
      currentWeight: 62.4,
      weightUnit: 'kg',
      punctualityWindowMinutes: 30,
      onboardingCompleted: true
    });
  }
}

function getProfile() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PROFILE);
  if (!sheet || sheet.getLastRow() < 2) return null;

  var row = sheet.getRange(2, 1, 1, 10).getValues()[0];
  return {
    userId: String(row[0] || 'usr_01'),
    name: String(row[1] || 'Sarah'),
    age: Number(row[2] || 22),
    gender: String(row[3] || 'female'),
    height: Number(row[4] || 165),
    heightUnit: String(row[5] || 'cm'),
    currentWeight: Number(row[6] || 62.4),
    weightUnit: String(row[7] || 'kg'),
    punctualityWindowMinutes: Number(row[8] || 30),
    onboardingCompleted: Boolean(row[9])
  };
}

function updateProfile(data) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PROFILE);
  var rowData = [
    data.userId || 'usr_01',
    data.name || 'User',
    data.age || 25,
    data.gender || 'female',
    data.height || 165,
    data.heightUnit || 'cm',
    data.currentWeight || 65.0,
    data.weightUnit || 'kg',
    data.punctualityWindowMinutes || 30,
    data.onboardingCompleted !== undefined ? data.onboardingCompleted : true
  ];

  if (sheet.getLastRow() >= 2) {
    sheet.getRange(2, 1, 1, 10).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  // Also log weight to weight history if provided
  if (data.currentWeight) {
    var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    updateWeight(data.currentWeight, todayStr, 'profile_update');
  }

  return getProfile();
}

function getMeals(dateFilter, startDate, endDate) {
  var ss = getSpreadsheet();
  var mealsSheet = ss.getSheetByName(SHEETS.MEALS);
  var trackingSheet = ss.getSheetByName(SHEETS.TRACKING);
  if (!mealsSheet || mealsSheet.getLastRow() < 2) return [];

  var mealsData = mealsSheet.getRange(2, 1, mealsSheet.getLastRow() - 1, 8).getValues();
  var trackingMap = {};

  if (trackingSheet && trackingSheet.getLastRow() >= 2) {
    var trackingData = trackingSheet.getRange(2, 1, trackingSheet.getLastRow() - 1, 4).getValues();
    for (var i = 0; i < trackingData.length; i++) {
      var tRow = trackingData[i];
      var mId = String(tRow[1]);
      trackingMap[mId] = {
        trackingId: String(tRow[0]),
        status: String(tRow[2] || 'PLANNED'),
        actualCompletionTime: tRow[3] ? String(tRow[3]) : null
      };
    }
  }

  var meals = [];
  for (var j = 0; j < mealsData.length; j++) {
    var row = mealsData[j];
    var mealId = String(row[0]);
    var mealDate = Utilities.formatDate(new Date(row[2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');

    if (dateFilter && mealDate !== dateFilter) continue;
    if (startDate && mealDate < startDate) continue;
    if (endDate && mealDate > endDate) continue;

    var track = trackingMap[mealId] || { status: 'PLANNED', actualCompletionTime: null };

    meals.push({
      mealId: mealId,
      userId: String(row[1]),
      date: mealDate,
      scheduledTime: String(row[3]),
      mealName: String(row[4]),
      calories: Number(row[5] || 0),
      notes: String(row[6] || ''),
      imageUrl: String(row[7] || ''),
      status: track.status,
      actualCompletionTime: track.actualCompletionTime
    });
  }

  return meals;
}

function createMeal(meal) {
  var ss = getSpreadsheet();
  var mealsSheet = ss.getSheetByName(SHEETS.MEALS);
  var trackingSheet = ss.getSheetByName(SHEETS.TRACKING);

  var mealId = meal.mealId || 'meal_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
  var userId = meal.userId || 'usr_01';
  var dateStr = meal.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var scheduledTime = meal.scheduledTime || '12:00';
  var mealName = meal.mealName || 'Planned Meal';
  var calories = Number(meal.calories || 0);
  var notes = meal.notes || '';
  var imageUrl = meal.imageUrl || '';

  mealsSheet.appendRow([mealId, userId, dateStr, scheduledTime, mealName, calories, notes, imageUrl]);

  var trackingId = 'track_' + mealId;
  var status = meal.status || 'PLANNED';
  var actualCompletionTime = meal.actualCompletionTime || '';
  trackingSheet.appendRow([trackingId, mealId, status, actualCompletionTime]);

  recalculateDailyStats(dateStr);

  return {
    mealId: mealId,
    userId: userId,
    date: dateStr,
    scheduledTime: scheduledTime,
    mealName: mealName,
    calories: calories,
    notes: notes,
    imageUrl: imageUrl,
    status: status,
    actualCompletionTime: actualCompletionTime || null
  };
}

function updateMeal(meal) {
  var ss = getSpreadsheet();
  var mealsSheet = ss.getSheetByName(SHEETS.MEALS);
  var trackingSheet = ss.getSheetByName(SHEETS.TRACKING);
  var mealId = meal.mealId || meal.meal_id;

  var mealsData = mealsSheet.getRange(2, 1, Math.max(1, mealsSheet.getLastRow() - 1), 8).getValues();
  var foundRow = -1;
  for (var i = 0; i < mealsData.length; i++) {
    if (String(mealsData[i][0]) === mealId) {
      foundRow = i + 2;
      break;
    }
  }

  if (foundRow > 1) {
    if (meal.date) mealsSheet.getRange(foundRow, 3).setValue(meal.date);
    if (meal.scheduledTime) mealsSheet.getRange(foundRow, 4).setValue(meal.scheduledTime);
    if (meal.mealName) mealsSheet.getRange(foundRow, 5).setValue(meal.mealName);
    if (meal.calories !== undefined) mealsSheet.getRange(foundRow, 6).setValue(Number(meal.calories));
    if (meal.notes !== undefined) mealsSheet.getRange(foundRow, 7).setValue(meal.notes);
    if (meal.imageUrl !== undefined) mealsSheet.getRange(foundRow, 8).setValue(meal.imageUrl);
  }

  if (meal.status || meal.actualCompletionTime) {
    updateMealTracking(mealId, meal.status, meal.actualCompletionTime);
  }

  if (meal.date) {
    recalculateDailyStats(meal.date);
  }

  return meal;
}

function deleteMeal(mealId) {
  var ss = getSpreadsheet();
  var mealsSheet = ss.getSheetByName(SHEETS.MEALS);
  var trackingSheet = ss.getSheetByName(SHEETS.TRACKING);

  var dateToUpdate = '';

  var mealsData = mealsSheet.getRange(2, 1, Math.max(1, mealsSheet.getLastRow() - 1), 3).getValues();
  for (var i = 0; i < mealsData.length; i++) {
    if (String(mealsData[i][0]) === mealId) {
      dateToUpdate = Utilities.formatDate(new Date(mealsData[i][2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      mealsSheet.deleteRow(i + 2);
      break;
    }
  }

  if (trackingSheet.getLastRow() >= 2) {
    var trackData = trackingSheet.getRange(2, 2, trackingSheet.getLastRow() - 1, 1).getValues();
    for (var j = 0; j < trackData.length; j++) {
      if (String(trackData[j][0]) === mealId) {
        trackingSheet.deleteRow(j + 2);
        break;
      }
    }
  }

  if (dateToUpdate) recalculateDailyStats(dateToUpdate);
  return mealId;
}

function completeMeal(mealId, completionTime) {
  var time = completionTime || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd\'T\'HH:mm:ss');
  updateMealTracking(mealId, 'COMPLETED', time);
  return { mealId: mealId, status: 'COMPLETED', actualCompletionTime: time };
}

function missMeal(mealId) {
  updateMealTracking(mealId, 'MISSED', null);
  return { mealId: mealId, status: 'MISSED', actualCompletionTime: null };
}

function updateMealTracking(mealId, status, actualCompletionTime) {
  var ss = getSpreadsheet();
  var trackingSheet = ss.getSheetByName(SHEETS.TRACKING);
  if (trackingSheet.getLastRow() < 2) {
    trackingSheet.appendRow(['track_' + mealId, mealId, status, actualCompletionTime || '']);
    return;
  }

  var data = trackingSheet.getRange(2, 2, trackingSheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]) === mealId) {
      trackingSheet.getRange(i + 2, 3).setValue(status);
      trackingSheet.getRange(i + 2, 4).setValue(actualCompletionTime || '');
      return;
    }
  }

  trackingSheet.appendRow(['track_' + mealId, mealId, status, actualCompletionTime || '']);
}

function getWeightHistory() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.WEIGHT);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  var list = [];
  for (var i = 0; i < data.length; i++) {
    var d = Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    list.push({
      date: d,
      weight: Number(data[i][1]),
      source: String(data[i][2] || 'user_entry')
    });
  }
  return list;
}

function updateWeight(weight, date, source) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.WEIGHT);
  var dateStr = date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var src = source || 'user_entry';

  // Check if an actual entry already exists for this exact date; update it or append
  if (sheet.getLastRow() >= 2) {
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < data.length; i++) {
      var d = Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (d === dateStr) {
        sheet.getRange(i + 2, 2).setValue(Number(weight));
        sheet.getRange(i + 2, 3).setValue(src);
        return { date: dateStr, weight: Number(weight), source: src };
      }
    }
  }

  sheet.appendRow([dateStr, Number(weight), src]);
  return { date: dateStr, weight: Number(weight), source: src };
}

function recalculateDailyStats(dateStr) {
  // Can recalculate and update row in Daily Statistics sheet
  var meals = getMeals(dateStr);
  var planned = meals.length;
  var completed = 0;
  var missed = 0;
  var onTime = 0;

  var profile = getProfile() || { punctualityWindowMinutes: 30 };
  var windowMins = profile.punctualityWindowMinutes || 30;

  for (var i = 0; i < meals.length; i++) {
    var m = meals[i];
    if (m.status === 'COMPLETED') {
      completed++;
      if (m.actualCompletionTime && isPunctual(m.scheduledTime, m.actualCompletionTime, windowMins)) {
        onTime++;
      }
    } else if (m.status === 'MISSED') {
      missed++;
    }
  }

  var adherence = planned > 0 ? Math.round((completed / planned) * 100) : null;
  var punctuality = completed > 0 ? Math.round((onTime / completed) * 100) : null;

  var ss = getSpreadsheet();
  var statsSheet = ss.getSheetByName(SHEETS.DAILY_STATS);
  if (!statsSheet) return;

  var foundRow = -1;
  if (statsSheet.getLastRow() >= 2) {
    var data = statsSheet.getRange(2, 1, statsSheet.getLastRow() - 1, 1).getValues();
    for (var j = 0; j < data.length; j++) {
      var d = Utilities.formatDate(new Date(data[j][0]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (d === dateStr) {
        foundRow = j + 2;
        break;
      }
    }
  }

  var rowVals = [dateStr, planned, completed, missed, adherence === null ? 'N/A' : adherence, onTime, punctuality === null ? 'N/A' : punctuality];
  if (foundRow > 1) {
    statsSheet.getRange(foundRow, 1, 1, 7).setValues([rowVals]);
  } else {
    statsSheet.appendRow(rowVals);
  }
}

function getDailyStatistics() {
  var ss = getSpreadsheet();
  var statsSheet = ss.getSheetByName(SHEETS.DAILY_STATS);
  if (!statsSheet || statsSheet.getLastRow() < 2) return [];

  var data = statsSheet.getRange(2, 1, statsSheet.getLastRow() - 1, 7).getValues();
  var list = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    list.push({
      date: Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      plannedMeals: Number(row[1] || 0),
      completedMeals: Number(row[2] || 0),
      missedMeals: Number(row[3] || 0),
      adherence: row[4] === 'N/A' || row[4] === '' ? null : Number(row[4]),
      onTimeMeals: Number(row[5] || 0),
      punctuality: row[6] === 'N/A' || row[6] === '' ? null : Number(row[6])
    });
  }
  return list;
}

function isPunctual(scheduledTime, actualTime, toleranceMins) {
  var sMins = parseTimeStr(scheduledTime);
  var aMins = parseTimeStr(actualTime);
  return Math.abs(aMins - sMins) <= toleranceMins;
}

function parseTimeStr(str) {
  if (!str) return 0;
  if (str.indexOf('T') !== -1) {
    var d = new Date(str);
    return d.getHours() * 60 + d.getMinutes();
  }
  var parts = str.split(':');
  return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
}
