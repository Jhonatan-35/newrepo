--assignment week02 Task Part one
SELECT *FROM public.account;

--Insert query 01
INSERT INTO account
        (
     account_firstname,
		 account_lastname,
		 account_email,
		 account_password
		)
VALUES('Tony','Stark','tony@starkent.com','Iam1ronM@n');
--Update query 02
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;

--Delete query 03
DELETE FROM public.account
WHERE account_id =1;

--Update query 04
 UPDATE public.inventory
 SET inv_description = REPLACE(inv_description,'small interiors','huge interior')
 WHERE inv_id = 10;

--Select query 4
SELECT inv_make ,inv_model,classification_name
FROM public.inventory
INNER JOIN public.classification ON inventory.classification_id = classification.classification_id
WHERE classification.classification_id =2;

--Update again query 5
UPDATE public.inventory
SET inv_image =REPLACE(inv_image,'/image','/images/vehicles'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/image','images/vehicles/');

