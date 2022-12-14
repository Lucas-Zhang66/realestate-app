import React, { useState, useEffect } from "react";
import {
  Flex,
  Select,
  Box,
  Text,
  Input,
  Spinner,
  Icon,
  Button,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { MdCancel } from "react-icons/md";
import Image from "next/image";
import { filterData, getFilterValues } from "../utils/filterData";
import { fetchApi, baseUrl } from "../utils/fetchApi";
import noresult from "../assets/image/noresult.svg";
const SearchFilters = () => {
  const [filters, setFilters] = useState(filterData);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState();
  const [showLocation, setShowLocation] = useState(false);
  const router = useRouter();

  const searchProperties = (filterValues) => {
    const path = router.pathname;
    const { query } = router;

    const values = getFilterValues(filterValues);

    values.forEach((item) => {
      if (item.value && filterValues?.[item.name]) {
        query[item.name] = item.value;
      }
    });

    router.push({ pathname: path, query: query });
  };

  useEffect(() => {
    if (searchTerm !== "") {
      const fetchData = async () => {
        setLoading(true);
        const data = await fetchApi(
          `${baseUrl}/auto-complete?query=${searchTerm}`
        );
        setLoading(false);
        setLocationData(data?.hits);
      };
      fetchData();
    }
  }, [searchTerm]);

  return (
    <Flex bg='gray.100' p='4' justifyContent='center' flexWrap='wrap'>
      {filters.map((filter) => (
        <Box key={filter.queryName}>
          <Select
            placeholder={filter.placeholder}
            onChange={(e) =>
              searchProperties({ [filter.queryName]: e.target.value })
            }
            w='fit-content'
            p='2'
          >
            {filter?.items?.map((item) => (
              <option value={item.value} key={item.name}>
                {item.name}
              </option>
            ))}
          </Select>
        </Box>
      ))}
      <Flex flexDirection='column'>
        <Button
          onClick={() => setShowLocation(!showLocation)}
          border='1px'
          borderColor='gray.200'
          marginTop='2'
        >
          Search Location
        </Button>

        {showLocation && (
          <Flex flexDirection='column' position='relative' paddingTop='2'>
            <Input
              placeholder='Search Location'
              value={searchTerm}
              w='300px'
              focusBorderColor='gray.300'
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm !== "" && (
              <Icon
                as={MdCancel}
                pos='absolute'
                cursor='pointer'
                right='5'
                top='5'
                zIndex='100'
                onClick={() => setSearchTerm("")}
              />
            )}

            {loading && <Spinner margin='auto' marginTop='3' />}

            {showLocation && (
              <Box height='300px' overflow='auto'>
                {locationData?.map((location) => (
                  <Box
                    key={location.id}
                    onClick={() => {
                      searchProperties({
                        locationExternalIDs: location.externalID,
                      });
                      setShowLocation(false);
                      setSearchTerm(location.name);
                    }}
                  >
                    <Text
                      cursor='pointer'
                      bg='gray.200'
                      p='2'
                      borderBottom='1px'
                      borderColor='gray.100'
                    >
                      {location.name}
                    </Text>
                  </Box>
                ))}
                {!loading && !locationData?.length && (
                  <Flex
                    justifyContent='center'
                    alignItems='center'
                    flexDirection='column'
                    marginTop='5'
                    marginBottom='5'
                  >
                    <Image src={noresult} alt='no result' />
                    <Text fontSize='xl' marginTop='3'>
                      Waiting to search!
                    </Text>
                  </Flex>
                )}
              </Box>
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default SearchFilters;
