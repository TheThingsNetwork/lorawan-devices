# Template Generator

This is a Command-line tool to generate and fill Device Repository templates.

## Documentation

Once you clone lorawan-device repository and create a new branch to add your devices run `make file` in your terminal, this command will launch template generator.

Templates are generated individually so select your template and fill the information.

<img width="580" alt="Screen Shot 2021-08-15 at 19 55 46" src="https://user-images.githubusercontent.com/81958808/129498295-3f353500-4599-4747-9f63-17b43fd81d87.png">

To save our file is important to follow `Output path: ./vendor/vendor_name/file_name.yaml`
- <vendor_name> must be filled with your vendor name.
- <file_name> must be filled with the file name you write + `.yaml` extension

### Example

We are going to add a new board to device repository, we create a new branch and run `make file`

## Index

Select index option and enter Fill Index Template, you must fill all information and output path.

![Screen Shot 2021-08-18 at 16 20 12](https://user-images.githubusercontent.com/81958808/129973678-36c1d946-c3ed-4f3b-83b0-62e5694f7864.png)

A new folder has been created inside vendor and contains `index.yaml` file.

![Screen Shot 2021-08-18 at 16 23 12](https://user-images.githubusercontent.com/81958808/129973919-f6532b37-425d-4c49-8eee-586ee9581f18.png)

## End Device

Select device option, fill all the required information and the output path.

![Screen Shot 2021-08-18 at 16 26 59](https://user-images.githubusercontent.com/81958808/129974347-56de2165-0e42-4d85-82c1-ab283e33881b.png)

## Profile

Select profile option, fill file name (try to use your region as name ex. eu868, us915...) insert all the necessary information and output path.

![Screen Shot 2021-08-18 at 16 31 05](https://user-images.githubusercontent.com/81958808/129974807-00af3ecb-f6aa-4466-8a1c-8a9cfca00f25.png)

## Codec

To fill codec fill is necessary to have the decoder file name.
Select codec and fill the information.

![Screen Shot 2021-08-18 at 16 33 19](https://user-images.githubusercontent.com/81958808/129975030-5da94b50-7e85-443f-8dc2-87d46511f60b.png)


Once you finish to add files you can look at them insider the `vendor_name` folder with basic information, is neccesary to look all the files to review and fill missing information.

![Screen Shot 2021-08-18 at 16 35 53](https://user-images.githubusercontent.com/81958808/129975371-327882c7-1ee9-4d0e-9929-be53928fce04.png)

![Screen Shot 2021-08-18 at 16 37 39](https://user-images.githubusercontent.com/81958808/129975484-7ce4b9e9-9a42-4043-8e2b-330f1b412a1a.png)

