set global log_bin_trust_function_creators = 1;
----
DROP FUNCTION IF EXISTS enroll_merchant_convert_user_id;
----
CREATE FUNCTION enroll_merchant_convert_user_id($id int(11))
RETURNS VARCHAR(50)
BEGIN
DECLARE _temp varchar(50);
select Name INTO _temp from zxnz_enroll_merchant_User where zxnz_ID=$id;
RETURN _temp;
END
----
DROP FUNCTION IF EXISTS enroll_merchant_convert_user_uuid;
----
CREATE FUNCTION enroll_merchant_convert_user_uuid($uuid varchar(50))
RETURNS VARCHAR(50)
BEGIN
DECLARE _temp varchar(50);
select Name INTO _temp from zxnz_enroll_merchant_User where zxnz_UUID=$uuid;
RETURN _temp;
END
----
DROP FUNCTION IF EXISTS enroll_merchant_convert_merchant_uuid;
----
CREATE FUNCTION enroll_merchant_convert_merchant_uuid($uuid varchar(50))
RETURNS VARCHAR(50)
BEGIN
DECLARE _temp varchar(50);
select Name INTO _temp from zxnz_enroll_merchant_Merchant where zxnz_UUID=$uuid;
RETURN _temp;
END
----
DROP FUNCTION IF EXISTS enroll_merchant_convert_user_uuids;
----
CREATE FUNCTION enroll_merchant_convert_user_uuids(_ids varchar(2000))
RETURNS varchar(1000)
begin
	declare _seeds varchar(1000) default ',';
	declare _seed varchar(100) default '';
	declare _id varchar(50);
	declare _split int;
	declare _len int;
	set _len = char_length(_ids);

  	while _len > 1 do
		set _split = locate(',', _ids, 2);
		set _id = substring(_ids, 2, (_split - 2));
		set _ids = substring(_ids, _split, (_len - _split + 1));
		set _len = char_length(_ids);
		set _seed = '';

        select Name INTO _seed from zxnz_enroll_merchant_User where zxnz_UUID=IFNULL(_id, '');

		if char_length(_seed)>=1 then
			set _seeds = concat(_seeds, _seed, ',');
		end if;
  	end while;

	return _seeds;
end