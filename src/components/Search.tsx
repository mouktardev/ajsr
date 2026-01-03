import { HomeLayout } from "@/lib/route-api";
import { useQueries } from "@/lib/tinybase";
import { IconSearch } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "./ui/input-group";
import { Label } from "./ui/label";


export function Search() {
    const queriesReference = useQueries()
    const { search } = HomeLayout.useSearch();
    const navigate = useNavigate({ from: "/report" });
    const handleSearch = useDebouncedCallback((searchTerm: string) => {
        navigate({
            search: (prev: any) => ({
                ...prev,
                search: searchTerm,
            }),
        })
    }, 300);

    useEffect(() => {
        queriesReference?.setQueryDefinition(
            "manuscriptsQuery", //queryId
            "manuscripts", //tableId
            ({ select, having }) => {
                select('manuscriptId')
                select("title");
                select("author");
                select("editor");
                select("type");
                select("initialSubmissionDate");
                select("editorialStatus");
                select("daysWithEditor");
                //search condition 
                having((getCell) =>
                    (getCell("manuscriptId") as string).includes(search)
                );
            }
        );
        return () => {
            queriesReference?.delQueryDefinition("manuscriptsQuery")
        }
    },
        [queriesReference, search]
    )

    return (
        <div className="flex items-center gap-2">
            <Label htmlFor="search-manuscript" className="sr-only">Search</Label>
            <InputGroup className="w-full max-w-md bg-background">
                <InputGroupAddon align="inline-start">
                    <InputGroupText>
                        <IconSearch size={16} strokeWidth={2} />
                    </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                    id="search-manuscript"
                    placeholder="ابحث برقم المخطوطة..."
                    type="search"
                    defaultValue={search}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </InputGroup>
        </div>
    )
}