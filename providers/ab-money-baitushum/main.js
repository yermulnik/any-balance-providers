﻿/**
Провайдер AnyBalance (http://any-balance-providers.googlecode.com)
*/

var g_countersTable = {
	common: {
		'fio': 'info.fio'
	}, 
	card: {
    "balance": "cards.balance",
    "currency": "cards.currency",
    "cardnum": "cards.num",
    "accnum": "cards.accnum",
		"__tariff": "cards.num",
		"type": "cards.__name",
		"status": "cards.status",
		"till": "cards.till",
		"date_start": "cards.date_start",
	},
  acc: {
    "balance": "accounts.balance",
    "available": "accounts.available",
    "currency": "accounts.currency",
    "accnum": "accounts.num",
    "status": "accounts.status",
    "last_movement": "accounts.last_movement"
  }
};

function shouldProcess(counter, info){
	var prefs = AnyBalance.getPreferences();
	
	if(!info || (!info.__id || !info.__name))
		return false;
	
	switch(counter){
		case 'cards':
		{
			if(prefs.type != 'card')
				return false;
		    if(!prefs.num)
		    	return true;
			
			if(endsWith(info.num, prefs.num))
				return true;
		    
			return false;
		}
		case 'accounts':
		{
			if(prefs.type != 'acc')
				return false;
		    if(!prefs.num)
		    	return true;
			
			if(endsWith(info.num, prefs.num))
				return true;
		}
		case 'credits':
		{
			if(prefs.type != 'crd')
				return false;
		    if(!prefs.num)
		    	return true;
			
			if(endsWith(info.num, prefs.num))
				return true;
		}	
		case 'deposits':
		{
			if(prefs.type != 'dep')
				return false;
		    if(!prefs.num)
		    	return true;
			
			if(endsWith(info.num, prefs.num))
				return true;
		}
		default:
			return false;
	}
}

function main() {
	var prefs = AnyBalance.getPreferences();
	
    if(!/^(card|crd|dep|acc)$/i.test(prefs.type || ''))
    	prefs.type = 'card';
	
    var adapter = new NAdapter(joinObjects(g_countersTable[prefs.type], g_countersTable.common), shouldProcess);
	
    adapter.processCards    = adapter.envelope(processCards);
    adapter.processAccounts = adapter.envelope(processAccounts);
    adapter.processCredits  = adapter.envelope(processCredits);
    adapter.processDeposits = adapter.envelope(processDeposits);
	  adapter.processInfo     = adapter.envelope(processInfo);

  var html = login(prefs);

    var result = {success: true};

  processInfo(html, result);

    if(prefs.type == 'card') {
      adapter.processCards(html, result);

      if(!adapter.wasProcessed('cards'))
        throw new AnyBalance.Error(prefs.num ? 'Не найдена карта с последними цифрами ' + prefs.num : 'У вас нет ни одной карты!');

      result = adapter.convert(result);
    } else if(prefs.type == 'acc') {
      adapter.processAccounts(html, result);

      if(!adapter.wasProcessed('accounts'))
        throw new AnyBalance.Error(prefs.num ? 'Не найден счет с последними цифрами ' + prefs.num : 'У вас нет ни одного счета!');

      result = adapter.convert(result);
    } else if(prefs.type == 'crd') {
      adapter.processCredits(html, result);

      if(!adapter.wasProcessed('credits'))
        throw new AnyBalance.Error(prefs.num ? 'Не найден кредит с последними цифрами ' + prefs.num : 'У вас нет ни одного кредита!');

      result = adapter.convert(result);
    } else if(prefs.type == 'dep') {
      adapter.processDeposits(html, result);

      if(!adapter.wasProcessed('deposits'))
        throw new AnyBalance.Error(prefs.num ? 'Не найден депозит с последними цифрами ' + prefs.num : 'У вас нет ни одного депозита!');

      result = adapter.convert(result);
    }

    AnyBalance.setResult(result);
}
